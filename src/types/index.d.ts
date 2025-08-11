export interface IIndex {
  value: string
}

export interface HL7Segment {
  segmentType: string
  fields: string[]
}

export interface ParsedHL7Segment {
  segmentType: string
  [key: string]: string
}
