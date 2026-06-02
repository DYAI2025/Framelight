import { mapWordthreatResponseToAnalysisOutput } from "./mappers";
import { WORDTHREAT_MOCK_SUCCESS_FIXTURE } from "./fixtures";
import { normalizeApiError } from "./errors";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING WORDTHREAT v1 CLIENT & MAPPER TESTS ===");

// 1. Test Mapper on the standard fixture
try {
  const output = mapWordthreatResponseToAnalysisOutput(WORDTHREAT_MOCK_SUCCESS_FIXTURE);

  assert(output.title === "Entscheidungsdiskurs & Vertrauensfrage (v1 API)", "Title mapping");
  assert(output.overall.manipulationRisk === "medium", "Overall manipulationRisk mapping");
  assert(output.overall.riskScore === 2.8, "Overall riskScore mapping");
  assert(output.overall.confidence === "high", "Overall confidence rating mapping");
  assert(output.overall.confidenceScore === 92, "Overall confidenceScore mapping");
  assert(output.overall.markerDensity === 33, "Overall density mapping");
  assert(output.overall.dominantPattern === "Schuldumkehr", "Overall pattern mapping");
  assert(output.overall.segmentsAnalyzed === 9, "Overall segments count mapping");
  assert(output.overall.speakersDetected === 2, "Overall speakers count mapping");

  // Validate presence structure
  assert(output.segments.length === 9, "Segments array length match");
  assert(output.segments[0].id === "S1", "Segment S1 identification");
  assert(output.segments[0].findings.includes("F1"), "Segment findings cross-association");

  // Validate speaker detail extraction
  assert(output.speakers.length === 2, "Speakers detail calculated correctly");
  const speakerA = output.speakers.find(s => s.id === "A");
  assert(!!speakerA, "Speaker A profile presence");
  assert(speakerA?.markerCount === 4, "Speaker A total markers count matches list");
  assert(speakerA?.overallRisk === "medium", "Speaker A risk status calculated");

  // Validate finding mapping
  assert(output.findings.length === 4, "Findings array completeness");
  const findingF2 = output.findings.find(f => f.id === "F2");
  assert(!!findingF2, "Finding F2 mapping presence");
  assert(findingF2?.marker === "Schuldumkehr & Framing", "Finding F2 marker label");
  assert(findingF2?.risk === "medium", "Finding F2 risk level mapping");
  assert(findingF2?.evidence.includes("Kopplung von Sachkritik an Beziehungs-Vertrauen"), "Finding F2 evidence linkage");

  // Validate timeline points
  assert(output.timeline.length === 9, "Timeline points projection length match");
  const timelineS3 = output.timeline.find(t => t.segmentId === "S3");
  assert(!!timelineS3, "Timeline point S3 present");
  assert(timelineS3?.maxIntensity === 4, "Timeline point intensity mapping");
  assert(timelineS3?.risk === "medium", "Timeline point risk mapping");

} catch (err: any) {
  console.error("Critical Mapper Test Failure:", err);
  process.exit(1);
}

// 2. Test Error Normalization
try {
  // Test network failure
  const netErr = normalizeApiError(new Error("failed to fetch from host"));
  assert(netErr.kind === "network", "Network error detection");
  assert(netErr.retryable === true, "Network error is retryable");

  // Test status code mapping using mocking structures (or direct Response emulation)
  // Emulate Response
  const fakeResponse = {
    status: 401,
    ok: false,
    json: async () => ({})
  } as unknown as Response;

  const authErr = normalizeApiError(fakeResponse);
  assert(authErr.kind === "auth", "Status 401 authorized mapping to auth kind");
  assert(authErr.status === 401, "Status code preservation");
  assert(!authErr.retryable, "Authorization failure is not retryable");

  const serverErr = normalizeApiError(new Response(null, { status: 503 }));
  assert(serverErr.kind === "server_error", "Status 503 mapping to server_error");
  assert(serverErr.retryable === true, "Server error is retryable");

  const clientErr = normalizeApiError(new Response(null, { status: 400 }));
  assert(clientErr.kind === "bad_request", "Status 400 maps to bad_request");

  const rateLimitErr = normalizeApiError(new Response(null, { status: 429 }));
  assert(rateLimitErr.kind === "rate_limit", "Status 429 maps to rate_limit");
  assert(rateLimitErr.retryable === true, "Rate limit is retryable");

  // Parse errors
  const parseErr = normalizeApiError(new SyntaxError("Unexpected token < in JSON at position 0"));
  assert(parseErr.kind === "parse_error", "JSON syntax exception detected as parse_error");

} catch (err: any) {
  console.error("Critical Error Normalizer Test Failure:", err);
  process.exit(1);
}

console.log("\n✨ ALL TESTS CONCLUDED SUCCESSFULLY! Wordthreat API layer is ready for merge. ✨");
