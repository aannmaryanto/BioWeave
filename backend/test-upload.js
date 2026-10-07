const http = require('http');
const fs = require('fs');
const path = require('path');

const API_PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${API_PORT}`;

// Helper function to build multipart/form-data payload
function createMultipartPayload(fields, fileInfo) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
  const CRLF = '\r\n';
  const chunks = [];

  for (const [key, val] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}${val}${CRLF}`));
  }

  if (fileInfo) {
    const { fieldName, filename, contentType, contentBuffer } = fileInfo;
    chunks.push(
      Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"${CRLF}Content-Type: ${contentType}${CRLF}${CRLF}`
      )
    );
    chunks.push(contentBuffer);
    chunks.push(Buffer.from(CRLF));
  }

  chunks.push(Buffer.from(`--${boundary}--${CRLF}`));

  const payloadBuffer = Buffer.concat(chunks);
  return { boundary, payloadBuffer };
}

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let responseData = Buffer.alloc(0);
        res.on('data', (chunk) => {
          responseData = Buffer.concat([responseData, chunk]);
        });
        res.on('end', () => {
          try {
            const text = responseData.toString('utf8');
            const parsed = text ? JSON.parse(text) : {};
            resolve({ status: res.statusCode, data: parsed, buffer: responseData, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData.toString('utf8'), buffer: responseData, headers: res.headers });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runUploadTests() {
  console.log('🧪 Starting Document Upload API Verification...');
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
    // 1. Register User 1 & User 2
    const u1Email = `upuser1_${Date.now()}@example.com`;
    const u2Email = `upuser2_${Date.now()}@example.com`;

    const r1 = await makeRequest('/api/auth/register', 'POST', JSON.stringify({ name: 'Uploader 1', email: u1Email, password: 'password123' }), { 'Content-Type': 'application/json' });
    const r2 = await makeRequest('/api/auth/register', 'POST', JSON.stringify({ name: 'Uploader 2', email: u2Email, password: 'password123' }), { 'Content-Type': 'application/json' });

    assert(r1.status === 201 && r2.status === 201, 'User 1 & User 2 registered');
    const u1Token = r1.data.token;
    const u2Token = r2.data.token;

    // 2. Test Unauthenticated Upload Attempt (No Token)
    const unauthUp = await makeRequest('/api/documents/upload', 'POST', null);
    assert(unauthUp.status === 401, 'Upload without auth token returns 401 Unauthorized');

    // 3. Test Upload PDF File (User 1)
    const contentStream = 'BT /F1 12 Tf 50 700 Td (LNP Formulation PDF Document) Tj ET';
    const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${contentStream.length} >>
stream
${contentStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000305 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;
    const pdfBuffer = Buffer.from(pdfString, 'utf8');
    const pdfPayload = createMultipartPayload(
      { title: 'LNP Formulation Protocol 2026', type: 'protocol', description: 'Lipid nanoparticle SOP' },
      { fieldName: 'file', filename: 'lnp_formulation.pdf', contentType: 'application/pdf', contentBuffer: pdfBuffer }
    );

    const pdfUpRes = await makeRequest('/api/documents/upload', 'POST', pdfPayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${pdfPayload.boundary}`,
    });

    assert(pdfUpRes.status === 201, 'Upload PDF returns 201 Created');
    assert(pdfUpRes.data.title === 'LNP Formulation Protocol 2026', 'Uploaded PDF title matches');
    assert(pdfUpRes.data.fileName === 'lnp_formulation.pdf', 'Uploaded PDF original fileName matches');
    assert(
      pdfUpRes.data.status === 'uploaded' || pdfUpRes.data.status === 'processed' || pdfUpRes.data.processingStatus === 'completed',
      'Uploaded PDF status is recorded correctly'
    );

    const pdfDocId = pdfUpRes.data._id || pdfUpRes.data.id;
    const pdfFilePath = pdfUpRes.data.filePath;

    // 4. Test Upload TXT File (User 1)
    const txtBuffer = Buffer.from('Lab notebook entry: Thermal shift assay of PETase double mutant.');
    const txtPayload = createMultipartPayload(
      { title: 'PETase Thermal Shift Assay Notes', type: 'lab_note' },
      { fieldName: 'file', filename: 'petase_notes.txt', contentType: 'text/plain', contentBuffer: txtBuffer }
    );

    const txtUpRes = await makeRequest('/api/documents/upload', 'POST', txtPayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${txtPayload.boundary}`,
    });

    assert(txtUpRes.status === 201, 'Upload TXT returns 201 Created');
    assert(txtUpRes.data.fileName === 'petase_notes.txt', 'Uploaded TXT original fileName matches');

    // 5. Test Upload DOCX File (User 1)
    const docxBuffer = Buffer.from('Fake docx content header');
    const docxPayload = createMultipartPayload(
      { title: 'CRISPR Cas12a SOP', type: 'protocol' },
      { fieldName: 'file', filename: 'cas12a.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', contentBuffer: docxBuffer }
    );

    const docxUpRes = await makeRequest('/api/documents/upload', 'POST', docxPayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${docxPayload.boundary}`,
    });

    assert(docxUpRes.status === 201, 'Upload DOCX returns 201 Created');

    // 6. Test Reject Unsupported File Type (.exe)
    const exeBuffer = Buffer.from('MZ executable binary data');
    const exePayload = createMultipartPayload(
      { title: 'Malicious Executable', type: 'protocol' },
      { fieldName: 'file', filename: 'malware.exe', contentType: 'application/x-msdownload', contentBuffer: exeBuffer }
    );

    const exeUpRes = await makeRequest('/api/documents/upload', 'POST', exePayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${exePayload.boundary}`,
    });

    assert(exeUpRes.status === 400, 'Upload unsupported file type (.exe) returns 400 Bad Request');

    // 7. Test Reject Missing File
    const noFilePayload = createMultipartPayload(
      { title: 'Doc Without File', type: 'protocol' },
      null
    );

    const noFileUpRes = await makeRequest('/api/documents/upload', 'POST', noFilePayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${noFilePayload.boundary}`,
    });

    assert(noFileUpRes.status === 400, 'Upload request without file returns 400 Bad Request');

    // 8. Test Reject File > 10 MB
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB
    const largePayload = createMultipartPayload(
      { title: 'Large 11MB File', type: 'literature' },
      { fieldName: 'file', filename: 'large_paper.pdf', contentType: 'application/pdf', contentBuffer: largeBuffer }
    );

    const largeUpRes = await makeRequest('/api/documents/upload', 'POST', largePayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${largePayload.boundary}`,
    });

    assert(largeUpRes.status === 400, 'Upload file > 10 MB returns 400 Bad Request');

    // 9. Test Secure File Download by Owner (User 1)
    const ownerFileRes = await makeRequest(`/api/documents/${pdfDocId}/file`, 'GET', null, {
      Authorization: `Bearer ${u1Token}`,
    });

    assert(ownerFileRes.status === 200, 'Owner can download file (200)');
    assert(ownerFileRes.buffer.toString('utf8').includes('%PDF-1.4'), 'Downloaded file content matches uploaded PDF');

    // 10. Test Prevent Another User from Accessing File (User 2)
    const otherUserFileRes = await makeRequest(`/api/documents/${pdfDocId}/file`, 'GET', null, {
      Authorization: `Bearer ${u2Token}`,
    });

    assert(
      otherUserFileRes.status === 403 || otherUserFileRes.status === 404,
      'Another user accessing document file returns 403 or 404'
    );

    // 11. Test Delete Document & Verify File Deletion
    const fileExistsBeforeDelete = pdfFilePath && fs.existsSync(pdfFilePath);
    assert(fileExistsBeforeDelete, 'Uploaded physical file exists on disk before delete');

    const deleteDocRes = await makeRequest(`/api/documents/${pdfDocId}`, 'DELETE', null, {
      Authorization: `Bearer ${u1Token}`,
    });

    assert(deleteDocRes.status === 200, 'DELETE /api/documents/:id returns 200');

    const fileExistsAfterDelete = pdfFilePath && fs.existsSync(pdfFilePath);
    assert(!fileExistsAfterDelete, 'Physical file is unlinked/deleted from disk after document deletion');

    console.log(`\n🎉 Document Upload API Test Results: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test Execution Error:', err);
    process.exit(1);
  }
}

runUploadTests();
