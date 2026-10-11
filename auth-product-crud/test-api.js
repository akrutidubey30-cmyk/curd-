/**
 * End-to-End API Test Script
 * Verifies all authentication and product endpoints against requirements.
 */

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n===============================================');
  console.log('🧪 Starting End-to-End API Test Suite');
  console.log('===============================================\n');

  // Test 1: Health check
  console.log('1. Testing /api/health');
  try {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'ok', 'Server is healthy (200)');
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // Test 2: Validation errors on Register
  console.log('\n2. Testing Validation Errors on /api/auth/register');
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'invalid-email', password: '123', confirmPassword: '456' })
    });
    const data = await res.json();
    assert(res.status === 400, 'Returns HTTP 400 on validation failure');
    assert(data.success === false, 'Returns success: false');
    assert(Array.isArray(data.errors) && data.errors.length > 0, 'Returns errors array in specified format');
    assert(data.errors.some(e => e.field === 'email'), 'Identified email field in validation errors');
  } catch (e) {
    assert(false, `Register validation test failed: ${e.message}`);
  }

  // Test 3: Valid Registration
  console.log('\n3. Testing Valid User Registration');
  const uniqueId = Date.now();
  const testUser = {
    name: 'Student Developer',
    email: `student_${uniqueId}@example.com`,
    password: 'securePassword123',
    confirmPassword: 'securePassword123'
  };

  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    assert(res.status === 201, 'Returns HTTP 201 Created on registration');
    assert(data.success === true, 'Returns success: true');
    assert(data.user && data.user.email === testUser.email, 'User object returned without password');
    assert(!data.user.password, 'Password hash is NEVER returned in response');
    assert(!data.accessToken, 'Does NOT generate tokens during registration as specified');
  } catch (e) {
    assert(false, `Registration failed: ${e.message}`);
  }

  // Test 4: Duplicate Email Registration (Must return 409)
  console.log('\n4. Testing Duplicate Email Registration');
  try {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const data = await res.json();
    assert(res.status === 409, 'Returns HTTP 409 Conflict for duplicate email');
    assert(data.success === false, 'Returns success: false');
  } catch (e) {
    assert(false, `Duplicate registration test failed: ${e.message}`);
  }

  // Test 5: Login with Invalid Credentials (Must return 401 without revealing field)
  console.log('\n5. Testing Login with Invalid Credentials');
  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' })
    });
    const data = await res.json();
    assert(res.status === 401, 'Returns HTTP 401 Unauthorized');
    assert(data.message.toLowerCase().includes('invalid email or password'), 'Generic message does not reveal field');
  } catch (e) {
    assert(false, `Invalid login test failed: ${e.message}`);
  }

  // Test 6: Login with Valid Credentials
  console.log('\n6. Testing Login with Valid Credentials');
  let accessToken = null;
  let refreshCookie = null;

  try {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');

    assert(res.status === 200, 'Returns HTTP 200 OK on login');
    assert(data.success === true, 'Returns success: true');
    assert(typeof data.accessToken === 'string' && data.accessToken.length > 20, 'Returns accessToken in JSON');
    assert(setCookie && setCookie.includes('refreshToken='), 'Sends refreshToken in Set-Cookie');
    assert(setCookie && setCookie.includes('HttpOnly'), 'Refresh token cookie is HttpOnly');

    accessToken = data.accessToken;
    // Extract cookie value for subsequent requests
    if (setCookie) {
      const match = setCookie.match(/refreshToken=([^;]+)/);
      if (match) {
        refreshCookie = `refreshToken=${match[1]}`;
      }
    }
  } catch (e) {
    assert(false, `Login test failed: ${e.message}`);
  }

  // Test 7: Protected Route /me with valid Bearer Token
  console.log('\n7. Testing GET /api/auth/me (Protected Route)');
  try {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK for /me');
    assert(data.success === true, 'Returns success: true');
    assert(data.user && data.user.email === testUser.email, 'Returns correct logged-in user profile');
    assert(!data.user.password, 'Does not return password');
  } catch (e) {
    assert(false, `/me test failed: ${e.message}`);
  }

  // Test 8: Protected Route without token
  console.log('\n8. Testing Protected Route without Token');
  try {
    const res = await fetch(`${baseUrl}/auth/me`);
    const data = await res.json();
    assert(res.status === 401, 'Rejects missing token with HTTP 401');
    assert(data.success === false, 'Returns success: false');
  } catch (e) {
    assert(false, `Protected route rejection test failed: ${e.message}`);
  }

  // Test 9: Refresh Token Endpoint
  console.log('\n9. Testing POST /api/auth/refresh-token');
  let newAccessToken = null;
  try {
    const res = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Cookie': refreshCookie || ''
      }
    });
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK on token refresh');
    assert(data.success === true, 'Returns success: true');
    assert(typeof data.accessToken === 'string', 'Returns new accessToken');
    newAccessToken = data.accessToken;
  } catch (e) {
    assert(false, `Refresh token test failed: ${e.message}`);
  }

  // Test 10: GET all products (Public route)
  console.log('\n10. Testing GET /api/products');
  let sampleProductId = null;
  try {
    const res = await fetch(`${baseUrl}/products`);
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK for public product list');
    assert(Array.isArray(data.products), 'Returns products array');
    assert(data.products.length >= 5, 'Sample seeded products are present (>= 5)');
    assert(data.pagination && data.pagination.total >= 5, 'Pagination metadata included');
    sampleProductId = data.products[0].id;
  } catch (e) {
    assert(false, `GET products test failed: ${e.message}`);
  }

  // Test 11: GET product by ID
  console.log(`\n11. Testing GET /api/products/:id (ID: ${sampleProductId})`);
  try {
    const res = await fetch(`${baseUrl}/products/${sampleProductId}`);
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK for single product');
    assert(data.product && data.product.id === sampleProductId, 'Product details match requested ID');
  } catch (e) {
    assert(false, `GET product by ID failed: ${e.message}`);
  }

  // Test 12: GET non-existent product
  console.log('\n12. Testing GET /api/products/non-existent-id (404 Not Found)');
  try {
    const res = await fetch(`${baseUrl}/products/invalid-id-9999`);
    const data = await res.json();
    assert(res.status === 404, 'Returns HTTP 404 for non-existent product');
    assert(data.success === false, 'Returns success: false');
  } catch (e) {
    assert(false, `404 test failed: ${e.message}`);
  }

  // Test 13: Create Product without Token (Must fail 401)
  console.log('\n13. Testing Create Product without Auth (Must be Protected)');
  try {
    const res = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unprotected Item',
        description: 'Should fail',
        price: 19.99,
        stock: 5,
        category: 'Test'
      })
    });
    assert(res.status === 401, 'Rejects unauthenticated product creation (HTTP 401)');
  } catch (e) {
    assert(false, `Unprotected create test failed: ${e.message}`);
  }

  // Test 14: Create Product with Validation Errors (Price <= 0)
  console.log('\n14. Testing Product Creation Validation Errors');
  try {
    const res = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newAccessToken || accessToken}`
      },
      body: JSON.stringify({
        name: '',
        description: '',
        price: -10,
        stock: -5,
        category: ''
      })
    });
    const data = await res.json();
    assert(res.status === 400, 'Returns HTTP 400 on product validation errors');
    assert(Array.isArray(data.errors) && data.errors.length > 0, 'Returns structured validation errors');
  } catch (e) {
    assert(false, `Product validation test failed: ${e.message}`);
  }

  // Test 15: Create Valid Product
  console.log('\n15. Testing Valid Product Creation');
  let createdProductId = null;
  try {
    const res = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newAccessToken || accessToken}`
      },
      body: JSON.stringify({
        name: 'Ultra-Quiet Mechanical Keyboard',
        description: 'Compact wireless mechanical keyboard with silent tactile switches and RGB lighting.',
        price: 139.99,
        stock: 15,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3'
      })
    });
    const data = await res.json();
    assert(res.status === 201, 'Returns HTTP 201 Created on valid product creation');
    assert(data.success === true, 'Returns success: true');
    assert(data.product && data.product.name === 'Ultra-Quiet Mechanical Keyboard', 'Created product data matches');
    createdProductId = data.product.id;
  } catch (e) {
    assert(false, `Valid product creation failed: ${e.message}`);
  }

  // Test 16: Update Product (PUT /api/products/:id)
  console.log(`\n16. Testing Update Product (ID: ${createdProductId})`);
  try {
    const res = await fetch(`${baseUrl}/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newAccessToken || accessToken}`
      },
      body: JSON.stringify({
        price: 129.99,
        stock: 20
      })
    });
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK on product update');
    assert(data.product.price === 129.99, 'Product price successfully updated');
    assert(data.product.stock === 20, 'Product stock successfully updated');
  } catch (e) {
    assert(false, `Product update failed: ${e.message}`);
  }

  // Test 17: Delete Product (DELETE /api/products/:id)
  console.log(`\n17. Testing Delete Product (ID: ${createdProductId})`);
  try {
    const res = await fetch(`${baseUrl}/products/${createdProductId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${newAccessToken || accessToken}`
      }
    });
    const data = await res.json();
    assert(res.status === 200, 'Returns HTTP 200 OK on product deletion');
    assert(data.success === true, 'Returns success: true');

    // Confirm product is actually gone
    const checkRes = await fetch(`${baseUrl}/products/${createdProductId}`);
    assert(checkRes.status === 404, 'Deleted product now returns HTTP 404');
  } catch (e) {
    assert(false, `Product delete failed: ${e.message}`);
  }

  // Test 18: Logout (Revoke refresh token & clear cookie)
  console.log('\n18. Testing POST /api/auth/logout');
  try {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': refreshCookie || ''
      }
    });
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    assert(res.status === 200, 'Returns HTTP 200 OK on logout');
    assert(data.success === true, 'Returns success: true');
    assert(setCookie && (setCookie.includes('Max-Age=0') || setCookie.includes('expires=') || setCookie.includes('refreshToken=;')), 'Clears refresh token cookie');
  } catch (e) {
    assert(false, `Logout test failed: ${e.message}`);
  }

  // Test 19: Refresh Token after Logout (Must fail 401/403)
  console.log('\n19. Testing Refresh Token after Logout (Must Reject Revoked Token)');
  try {
    const res = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Cookie': refreshCookie || ''
      }
    });
    const data = await res.json();
    assert(res.status === 403 || res.status === 401, 'Rejects revoked refresh token (HTTP 401 or 403)');
    assert(data.success === false, 'Returns success: false');
  } catch (e) {
    assert(false, `Revoked token test failed: ${e.message}`);
  }

  console.log('\n===============================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
