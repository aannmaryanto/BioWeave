const http = require('http');
const fs = require('fs');
const path = require('path');
const { cleanExtractedText } = require('./src/services/documentProcessingService');

const API_PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${API_PORT}`;

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

// Generate valid standard PDF buffer with searchable text
function generateTestPdfBuffer(textToEmbed) {
  const contentStream = `BT /F1 12 Tf 50 700 Td (${textToEmbed}) Tj ET`;
  const streamLen = contentStream.length;

  const pdf = `%PDF-1.4
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
<< /Length ${streamLen} >>
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

  return Buffer.from(pdf, 'utf8');
}

async function runProcessingTests() {
  console.log('🧪 Starting Document Processing & Text Extraction Verification...');
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
    // 1. Text Cleaning Unit Test
    const dirtyText = "Line 1   with   spaces\r\n\r\n\r\n\r\nLine 2 with \x00 null chars  \n\nLine 3 \t with tabs.";
    const cleaned = cleanExtractedText(dirtyText);
    assert(
      !cleaned.includes('\r') && !cleaned.includes('\x00') && !cleaned.includes('\n\n\n'),
      'cleanExtractedText normalizes line endings, strips control chars, and reduces excessive blank lines'
    );

    // 2. Register Users
    const u1Email = `procuser1_${Date.now()}@example.com`;
    const u2Email = `procuser2_${Date.now()}@example.com`;

    const r1 = await makeRequest('/api/auth/register', 'POST', JSON.stringify({ name: 'Proc User 1', email: u1Email, password: 'password123' }), { 'Content-Type': 'application/json' });
    const r2 = await makeRequest('/api/auth/register', 'POST', JSON.stringify({ name: 'Proc User 2', email: u2Email, password: 'password123' }), { 'Content-Type': 'application/json' });

    assert(r1.status === 201 && r2.status === 201, 'User 1 & User 2 registered');
    const u1Token = r1.data.token;
    const u2Token = r2.data.token;

    // 3. Test TXT File Upload & Processing
    const txtContent = "CRISPR-Cas9 Gene Editing Protocol\nStep 1: Reconstitute gRNA at 100 uM concentration.\nStep 2: Incubation temperature: 37°C for 30 minutes.";
    const txtBuffer = Buffer.from(txtContent, 'utf8');
    const txtPayload = createMultipartPayload(
      { title: 'CRISPR Protocol TXT', type: 'protocol' },
      { fieldName: 'file', filename: 'crispr_protocol.txt', contentType: 'text/plain', contentBuffer: txtBuffer }
    );

    const txtUpRes = await makeRequest('/api/documents/upload', 'POST', txtPayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${txtPayload.boundary}`,
    });

    assert(txtUpRes.status === 201, 'TXT upload succeeds (201)');
    const txtDocId = txtUpRes.data._id || txtUpRes.data.id;

    // Fetch extracted text for TXT doc
    const txtTextRes = await makeRequest(`/api/documents/${txtDocId}/text`, 'GET', null, {
      Authorization: `Bearer ${u1Token}`,
    });

    assert(txtTextRes.status === 200, 'GET /api/documents/:id/text returns 200 for TXT document');
    assert(txtTextRes.data.processingStatus === 'completed', 'TXT document processingStatus is "completed"');
    assert(txtTextRes.data.extractedText.includes('CRISPR-Cas9 Gene Editing Protocol'), 'TXT extractedText contains full file text');

    // 4. Test PDF File Upload & Processing
    const pdfBuffer = generateTestPdfBuffer('Biotech Research PDF Text Extraction');
    const pdfPayload = createMultipartPayload(
      { title: 'Biotech Research Paper PDF', type: 'literature' },
      { fieldName: 'file', filename: 'research_paper.pdf', contentType: 'application/pdf', contentBuffer: pdfBuffer }
    );

    const pdfUpRes = await makeRequest('/api/documents/upload', 'POST', pdfPayload.payloadBuffer, {
      Authorization: `Bearer ${u1Token}`,
      'Content-Type': `multipart/form-data; boundary=${pdfPayload.boundary}`,
    });

    assert(pdfUpRes.status === 201, 'PDF upload succeeds (201)');
    const pdfDocId = pdfUpRes.data._id || pdfUpRes.data.id;

    const pdfTextRes = await makeRequest(`/api/documents/${pdfDocId}/text`, 'GET', null, {
      Authorization: `Bearer ${u1Token}`,
    });

    assert(pdfTextRes.status === 200, 'GET /api/documents/:id/text returns 200 for PDF document');
    assert(pdfTextRes.data.processingStatus === 'completed', 'PDF document processingStatus is "completed"');
    assert(pdfTextRes.data.extractedText.includes('Biotech Research PDF Text Extraction'), 'PDF extractedText contains PDF content');

    // 5. Test Process Endpoint (POST /api/documents/:id/process)
    const procEndpointRes = await makeRequest(`/api/documents/${txtDocId}/process`, 'POST', null, {
      Authorization: `Bearer ${u1Token}`,
    });

    assert(procEndpointRes.status === 200, 'POST /api/documents/:id/process returns 200');
    assert(procEndpointRes.data.document.processingStatus === 'completed', 'Process endpoint returns completed status');
    assert(typeof procEndpointRes.data.document.textLength === 'number', 'Process endpoint returns textLength without dumping huge text');

    // 6. Test User Isolation on Extracted Text (User 2 attempting User 1 doc)
    const u2AccessRes = await makeRequest(`/api/documents/${txtDocId}/text`, 'GET', null, {
      Authorization: `Bearer ${u2Token}`,
    });

    assert(
      u2AccessRes.status === 403 || u2AccessRes.status === 404,
      'GET /api/documents/:id/text for another user returns 403 Forbidden or 404 Not Found'
    );

    // 7. Test Missing Document (404)
    const missingDocRes = await makeRequest('/api/documents/nonexistent-id-9999/text', 'GET', null, {
      Authorization: `Bearer ${u1Token}`,
    });
    assert(missingDocRes.status === 404, 'GET /api/documents/nonexistent-id/text returns 404');

    // 8. Test Unsupported Format Processing Failure Handling
    const unsupportedDoc = {
      _id: `doc-unsupported-${Date.now()}`,
      title: 'Unsupported Executable Record',
      type: 'protocol',
      fileName: 'malware.exe',
      filePath: path.join(__dirname, 'uploads/test_malware.exe'),
      mimeType: 'application/octet-stream',
      uploadedBy: r1.data.user._id,
      processingStatus: 'pending',
    };
    fs.writeFileSync(unsupportedDoc.filePath, 'MZ binary content');

    const { processDocument } = require('./src/services/documentProcessingService');
    const failProc = await processDocument(unsupportedDoc);
    assert(failProc.processingStatus === 'failed', 'Unsupported format fails gracefully with processingStatus = "failed"');
    assert(failProc.processingError.length > 0, 'Unsupported format sets clear processingError message');
    if (fs.existsSync(unsupportedDoc.filePath)) fs.unlinkSync(unsupportedDoc.filePath);

    // 9. Test Clean Up Files
    await makeRequest(`/api/documents/${txtDocId}`, 'DELETE', null, { Authorization: `Bearer ${u1Token}` });
    await makeRequest(`/api/documents/${pdfDocId}`, 'DELETE', null, { Authorization: `Bearer ${u1Token}` });

    console.log(`\n🎉 Document Processing API Test Results: ${passed} Passed, ${failed} Failed`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test Execution Error:', err);
    process.exit(1);
  }
}

runProcessingTests();
