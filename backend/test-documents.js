const http = require('http');

const API_PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${API_PORT}`;

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runDocumentTests() {
  console.log('🧪 Starting Document Management API Verification...');
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

  try {
    // 1. Register User 1
    const user1Email = `docuser1_${Date.now()}@example.com`;
    const reg1Res = await makeRequest('/api/auth/register', 'POST', {
      name: 'Doc Tester 1',
      email: user1Email,
      password: 'password123',
    });
    assert(reg1Res.status === 201, 'User 1 registered successfully');
    const user1Token = reg1Res.data.token;

    // 2. Register User 2
    const user2Email = `docuser2_${Date.now()}@example.com`;
    const reg2Res = await makeRequest('/api/auth/register', 'POST', {
      name: 'Doc Tester 2',
      email: user2Email,
      password: 'password123',
    });
    assert(reg2Res.status === 201, 'User 2 registered successfully');
    const user2Token = reg2Res.data.token;

    // 3. Test Unauthorized Request (No Token)
    const unauthRes = await makeRequest('/api/documents', 'GET');
    assert(unauthRes.status === 401, 'GET /api/documents without token returns 401 Unauthorized');

    // 4. Test GET /api/documents for User 1 (Initially empty or seeded)
    const initialDocsRes = await makeRequest('/api/documents', 'GET', null, user1Token);
    assert(initialDocsRes.status === 200, 'GET /api/documents with valid token returns 200');

    // 5. Test POST /api/documents (Create document metadata)
    const createRes = await makeRequest(
      '/api/documents',
      'POST',
      {
        title: 'Single-Cell Sequencing of CAR-T Cells',
        description: 'Evaluation of exhaustion markers in 4-1BB constructs',
        type: 'literature',
        fileName: 'car_t_sequencing.pdf',
        fileSize: 3450000,
        mimeType: 'application/pdf',
      },
      user1Token
    );
    assert(createRes.status === 201, 'POST /api/documents creates document metadata (201)');
    const createdDoc = createRes.data;
    assert(createdDoc && createdDoc.title === 'Single-Cell Sequencing of CAR-T Cells', 'Created doc title matches');
    assert(createdDoc.status === 'uploaded', 'Created doc has default status "uploaded"');

    const createdDocId = createdDoc._id || createdDoc.id;

    // 6. Test GET /api/documents/:id (User 1)
    const getByIdRes = await makeRequest(`/api/documents/${createdDocId}`, 'GET', null, user1Token);
    assert(getByIdRes.status === 200, 'GET /api/documents/:id returns 200 for owner');
    assert(getByIdRes.data.title === 'Single-Cell Sequencing of CAR-T Cells', 'Document details match');

    // 7. Test User Isolation (User 2 trying to access User 1 document)
    const user2GetRes = await makeRequest(`/api/documents/${createdDocId}`, 'GET', null, user2Token);
    assert(user2GetRes.status === 404, "GET /api/documents/:id returns 404 when requesting another user's document");

    // 8. Test Filtering by Type
    const filterRes = await makeRequest('/api/documents?type=literature', 'GET', null, user1Token);
    assert(filterRes.status === 200 && Array.isArray(filterRes.data), 'GET /api/documents?type=literature returns 200');
    assert(
      filterRes.data.every((d) => d.type.toLowerCase().includes('lit')),
      'Filtered documents all match "literature" type'
    );

    // 9. Test Searching by Title
    const searchRes = await makeRequest('/api/documents?search=Sequencing', 'GET', null, user1Token);
    assert(searchRes.status === 200 && Array.isArray(searchRes.data), 'GET /api/documents?search=Sequencing returns 200');
    assert(
      searchRes.data.some((d) => d.title.includes('Sequencing')),
      'Search results include created document'
    );

    // 10. Test PUT /api/documents/:id (Owner update title, description, type)
    const updateRes = await makeRequest(
      `/api/documents/${createdDocId}`,
      'PUT',
      {
        title: 'Updated CAR-T Single-Cell Protocol',
        description: 'Updated description for lab protocol',
        type: 'protocol',
      },
      user1Token
    );
    assert(updateRes.status === 200, 'PUT /api/documents/:id updates document (200)');
    assert(updateRes.data.title === 'Updated CAR-T Single-Cell Protocol', 'Updated title saved');

    // 11. Test PUT User Isolation (User 2 trying to update User 1 document)
    const user2UpdateRes = await makeRequest(
      `/api/documents/${createdDocId}`,
      'PUT',
      { title: 'Hacked Title' },
      user2Token
    );
    assert(user2UpdateRes.status === 404, 'PUT /api/documents/:id returns 404 for non-owner');

    // 12. Test DELETE User Isolation (User 2 trying to delete User 1 document)
    const user2DeleteRes = await makeRequest(`/api/documents/${createdDocId}`, 'DELETE', null, user2Token);
    assert(user2DeleteRes.status === 404, 'DELETE /api/documents/:id returns 404 for non-owner');

    // 13. Test DELETE /api/documents/:id (Owner delete)
    const deleteRes = await makeRequest(`/api/documents/${createdDocId}`, 'DELETE', null, user1Token);
    assert(deleteRes.status === 200, 'DELETE /api/documents/:id deletes document (200)');

    // Verify document is gone
    const verifyDelRes = await makeRequest(`/api/documents/${createdDocId}`, 'GET', null, user1Token);
    assert(verifyDelRes.status === 404, 'GET /api/documents/:id returns 404 after deletion');

    console.log(`\n🎉 Document API Test Results: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test Execution Error:', err);
    process.exit(1);
  }
}

runDocumentTests();
