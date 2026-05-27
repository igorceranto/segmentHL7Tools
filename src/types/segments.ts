import type { ParsedHL7Segment } from './hl7'

export interface MSHSegment extends ParsedHL7Segment {
  segmentType: 'MSH'
  field1: string // MSH-1: field separator (always '|')
  field2: string // MSH-2: encoding characters ('^~\&')
  field3: string // MSH-3: sending application
  field4: string // MSH-4: sending facility
  field5: string // MSH-5: receiving application
  field6: string // MSH-6: receiving facility
  field7: string // MSH-7: date/time of message
  field8: string // MSH-8: security
  field9: string // MSH-9: message type (e.g. 'ADT^A01')
  field10: string // MSH-10: message control ID
  field11: string // MSH-11: processing ID
  field12: string // MSH-12: version ID
}

export interface PIDSegment extends ParsedHL7Segment {
  segmentType: 'PID'
  field1: string // PID-1: set ID
  field2: string // PID-2: patient ID (external)
  field3: string // PID-3: patient identifier list
  field4: string // PID-4: alternate patient ID
  field5: string // PID-5: patient name (FAMILY^GIVEN^MIDDLE)
  field6: string // PID-6: mother's maiden name
  field7: string // PID-7: date/time of birth
  field8: string // PID-8: sex (M/F/O/U)
  field11: string // PID-11: patient address
  field13: string // PID-13: phone number home
  field18: string // PID-18: patient account number
  field19: string // PID-19: SSN/CPF
}

export interface PV1Segment extends ParsedHL7Segment {
  segmentType: 'PV1'
  field1: string // PV1-1: set ID
  field2: string // PV1-2: patient class (I=Inpatient, O=Outpatient, E=Emergency)
  field3: string // PV1-3: assigned patient location
  field4: string // PV1-4: admission type
  field7: string // PV1-7: attending doctor
  field10: string // PV1-10: hospital service
  field17: string // PV1-17: admitting doctor
  field44: string // PV1-44: admit date/time
  field45: string // PV1-45: discharge date/time
}

export interface OBRSegment extends ParsedHL7Segment {
  segmentType: 'OBR'
  field1: string // OBR-1: set ID
  field2: string // OBR-2: placer order number
  field3: string // OBR-3: filler order number
  field4: string // OBR-4: universal service identifier
  field7: string // OBR-7: observation date/time
  field16: string // OBR-16: ordering provider
  field25: string // OBR-25: result status
}

export interface OBXSegment extends ParsedHL7Segment {
  segmentType: 'OBX'
  field1: string // OBX-1: set ID
  field2: string // OBX-2: value type (NM, ST, CWE, etc.)
  field3: string // OBX-3: observation identifier
  field4: string // OBX-4: observation sub-ID
  field5: string // OBX-5: observation value
  field6: string // OBX-6: units
  field7: string // OBX-7: reference range
  field8: string // OBX-8: interpretation codes
  field11: string // OBX-11: observation result status
}

export interface MSASegment extends ParsedHL7Segment {
  segmentType: 'MSA'
  field1: string // MSA-1: acknowledgment code (AA/AE/AR)
  field2: string // MSA-2: message control ID
  field3: string // MSA-3: text message
}

export function isMSH(segment: ParsedHL7Segment): segment is MSHSegment {
  return segment.segmentType === 'MSH'
}

export function isPID(segment: ParsedHL7Segment): segment is PIDSegment {
  return segment.segmentType === 'PID'
}

export function isPV1(segment: ParsedHL7Segment): segment is PV1Segment {
  return segment.segmentType === 'PV1'
}

export function isOBR(segment: ParsedHL7Segment): segment is OBRSegment {
  return segment.segmentType === 'OBR'
}

export function isOBX(segment: ParsedHL7Segment): segment is OBXSegment {
  return segment.segmentType === 'OBX'
}

export function isMSA(segment: ParsedHL7Segment): segment is MSASegment {
  return segment.segmentType === 'MSA'
}
