const http = require('http');
const assert = require('assert');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('=== STARTING MEDIKIOSK END-TO-END SIH26047 VERIFICATION ===\n');

  // Step 0: Verify Consent Enforcement (Negative Test)
  console.log('0. Negative Test: Session Creation without Consent...');
  const noConsentRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/sessions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Unconsenting Patient',
    age: 30,
    gender: 'female',
    language: 'English'
    // consent is omitted
  });
  assert.strictEqual(noConsentRes.status, 400, 'Expected 400 Bad Request when consent is missing');
  assert.strictEqual(noConsentRes.data.code, 'CONSENT_REQUIRED', 'Expected CONSENT_REQUIRED error code');
  console.log(`✓ Backend correctly rejected session without consent (HTTP ${noConsentRes.status}, code: ${noConsentRes.data.code})\n`);

  // Step 1: Create Patient Session with Consent
  console.log('1. Creating Patient Session (Hindi, Name: Demo Patient, Age: 42)...');
  const createRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/sessions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Demo Patient',
    age: 42,
    gender: 'male',
    language: 'Hindi',
    abhaStatus: 'no_abha',
    inputMode: 'both',
    consent: { given: true, timestamp: new Date().toISOString() }
  });
  assert.strictEqual(createRes.status, 201, 'Expected 201 Created for valid session');
  const session = createRes.data.session;
  const patient = createRes.data.patient;
  assert.ok(session && session.id, 'Session ID must exist');
  console.log(`✓ Session Created: ${session.id} | Patient: ${patient.name} (${patient.language})\n`);

  // Step 2: Record Consent Endpoint
  console.log('2. Recording Patient Consent Endpoint...');
  const consentRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/sessions/${session.id}/consent`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { timestamp: new Date().toISOString() });
  assert.strictEqual(consentRes.status, 200, 'Expected 200 OK for consent endpoint');
  assert.strictEqual(consentRes.data.status, 'consent_given', 'Expected status to be consent_given');
  console.log(`✓ Consent Status: ${consentRes.data.status}\n`);

  // Step 3: Conversational Voice Message & Follow Up
  console.log('3. Sending Patient Voice Transcript Message in Hindi...');
  const msgRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/conversation/message',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId: session.id,
    role: 'patient',
    message: 'Mujhe teen din se bukhar hai aur weakness bhi hai.',
    transcript: 'Mujhe teen din se bukhar hai aur weakness bhi hai.'
  });
  assert.strictEqual(msgRes.status, 201, 'Expected 201 Created for message');
  console.log(`✓ Message Recorded: "${msgRes.data.message}"`);

  const nextQRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/conversation/next-question',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId: session.id,
    step: 1,
    language: 'Hindi'
  });
  assert.strictEqual(nextQRes.status, 200, 'Expected 200 OK for next question');
  console.log(`✓ Next AI Question in Hindi: "${nextQRes.data.question}"\n`);

  // Step 4: Process OCR Document
  console.log('4. Processing Prescription Document OCR...');
  const ocrRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/ocr/process',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId: session.id,
    documentType: 'prescription'
  });
  assert.strictEqual(ocrRes.status, 200, 'Expected 200 OK for OCR process');
  assert.strictEqual(ocrRes.data.confidence, 0.78, 'Expected OCR confidence single source of truth 0.78');
  assert.strictEqual(ocrRes.data.extractedFields['Diagnosis mentioned in source document'], 'Viral Fever', 'Expected diagnosis to be labeled as source document mention');
  console.log(`✓ Document OCR Processed (Confidence: ${Math.round(ocrRes.data.confidence * 100)}%)`);
  console.log(`  Source Document Diagnosis: "${ocrRes.data.extractedFields['Diagnosis mentioned in source document']}"`);
  console.log(`  Extracted Medicine: ${ocrRes.data.extractedFields?.Medications?.[0] || ocrRes.data.extractedFields?.medications?.[0]}\n`);

  // Step 5: Generate AI Clinical History Draft
  console.log('5. Generating Assistive Clinical History Draft...');
  const summaryRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/summary/generate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId: session.id,
    messages: [
      { role: 'patient', message: 'Mujhe teen din se bukhar hai aur weakness bhi hai.' },
      { role: 'ai', message: 'Ye symptoms aapko exactly kab se hain?' },
      { role: 'patient', message: 'Teen din se.' }
    ]
  });
  assert.strictEqual(summaryRes.status, 200, 'Expected 200 OK for summary generation');
  assert.ok(summaryRes.data.draft, 'Draft object must be returned');
  assert.ok(summaryRes.data.draft.chiefComplaint, 'Chief complaint must be generated');
  console.log(`✓ Draft Chief Complaint: ${summaryRes.data.draft.chiefComplaint}`);
  console.log(`✓ Draft Duration: ${summaryRes.data.draft.duration}`);
  console.log(`✓ Draft Severity: ${summaryRes.data.draft.severity}\n`);

  // Step 6: Physician Review & Inline Edit
  console.log('6. Physician Review & Editing Field (Modifying Severity to "Mild")...');
  const editRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/physician/${session.id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    draft: { severity: 'Mild' },
    physicianEdits: { severity: 'Mild' }
  });
  assert.strictEqual(editRes.status, 200, 'Expected 200 OK for physician edit');
  assert.strictEqual(editRes.data.draft.severity, 'Mild', 'Expected draft severity to update to Mild');
  assert.strictEqual(editRes.data.physicianEdits.severity, 'Mild', 'Expected physicianEdits.severity to be Mild');
  console.log(`✓ Modified Severity: ${editRes.data.draft.severity} (Recorded in physicianEdits)\n`);

  // Step 7: Physician Approval
  console.log('7. Physician Approving & Finalizing Record...');
  const approveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/physician/${session.id}/approve`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { doctorId: 'Dr. Sharma (Consultant Physician)' });
  assert.strictEqual(approveRes.status, 200, 'Expected 200 OK for physician approval');
  assert.strictEqual(approveRes.data.history.approvalStatus, 'approved', 'Approval status must be approved');
  assert.strictEqual(approveRes.data.history.approvedBy, 'Dr. Sharma (Consultant Physician)');
  console.log(`✓ Approval Status: ${approveRes.data.history.approvalStatus} by ${approveRes.data.history.approvedBy}\n`);

  // Step 8: Generate HL7 FHIR R4 Bundle
  console.log('8. Generating Interoperable HL7 FHIR R4 Bundle...');
  const fhirRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/fhir/${session.id}`,
    method: 'GET'
  });
  assert.strictEqual(fhirRes.status, 200, 'Expected 200 OK for FHIR bundle endpoint');
  const bundle = fhirRes.data;
  assert.strictEqual(bundle.resourceType, 'Bundle', 'Resource type must be Bundle');
  assert.ok(bundle.entry && bundle.entry.length >= 2, 'Bundle must have at least Patient and Condition entries');
  const patientEntry = bundle.entry.find(e => e.resource && e.resource.resourceType === 'Patient');
  assert.ok(patientEntry, 'Bundle must contain a Patient resource');
  assert.strictEqual(patientEntry.resource.gender, 'male');
  
  const cond = bundle.entry.find(e => e.resource && e.resource.resourceType === 'Condition');
  assert.ok(cond, 'Bundle must contain a Condition resource');
  assert.strictEqual(cond.resource.verificationStatus.coding[0].display, 'Physician-Confirmed Finding');
  assert.strictEqual(cond.resource.severity.text, 'Mild', 'FHIR bundle must reflect physician-edited severity');
  // Ensure incorrect onsetAge is not present
  assert.strictEqual(cond.resource.onsetAge, undefined, 'onsetAge must not be incorrectly set');
  console.log(`✓ FHIR Bundle ID: ${bundle.id}`);
  console.log(`✓ Total Bundle Entries: ${bundle.entry.length}`);
  console.log(`✓ Condition Verification Status: ${cond.resource.verificationStatus.coding[0].display}`);
  console.log(`✓ Condition Severity (Reflecting Physician Edit): ${cond.resource.severity.text}\n`);

  // Step 9: AYUSH Dashavidha Record
  console.log('9. Saving AYUSH Dashavidha 10-Fold Assessment...');
  const ayushRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/ayush',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId: session.id,
    data: {
      prakriti: 'Vata-Pitta',
      vikriti: 'Pitta Vriddhi',
      sara: 'Mamsa Sara',
      samhanana: 'Madhyama',
      pramana: '172 cm / 68 kg',
      satmya: 'Madhyama',
      satva: 'Pravara',
      aharaShakti: 'Madhyama',
      vyayamaShakti: 'Avara',
      vaya: 'Madhya (42 Y)'
    }
  });
  assert.strictEqual(ayushRes.status, 201, 'Expected 201 Created for AYUSH record');
  assert.strictEqual(ayushRes.data.sessionId, session.id);
  console.log(`✓ AYUSH Record Created for Session: ${ayushRes.data.sessionId}\n`);

  console.log('===========================================================');
  console.log('🎉 ALL 9 P0/P1 END-TO-END WORKFLOW STAGES VERIFIED 100%!');
  console.log('===========================================================');
}

runTest().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
