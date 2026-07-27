/**
 * Types for the AnyTrip v3 API, modelled on the serialised output of the
 * API's construct methods
 *
 */

// ---------------------------------------------------------------------------
// Common entities
// ---------------------------------------------------------------------------

export interface Coordinates {
  lat: number
  lon: number
}

export interface StopName {
  station_name?: string
  station_readable_name?: string
  platform_readable_name?: string
  platform_name?: string
  platform_type?: string
}

export interface StopDisassembled {
  fullName?: string
  stationName?: string
  platformCombinedName?: string
  platformType?: string
  platformTypeAbbreviation?: string
  platformName?: string
}

export interface Stop {
  id: string
  code?: string | null
  secondaryId?: string | null
  modes: string[]
  facilities?: unknown
  locality?: string | null
  name?: StopName | string | null
  disassembled?: StopDisassembled | null
  fullName: string
  coordinates: Coordinates
  wheelchair?: number | boolean | null
  timezone?: string | null
  /** Service-weight score 1-10 (10 = busiest stop in the region). */
  weightScore?: number | null
  parent?: Stop | null
  /** Alternative names the stop is searchable under. */
  aliases?: string[]
  /** App path, e.g. "/stop/au2:200060" */
  _path: string
}

export interface Agency {
  id?: string
  name?: string
  url?: string | null
  phone?: string | null
  timezone?: string | null
  _path?: string
  [key: string]: unknown
}

export interface RouteInfo {
  id: string
  name: string | null
  longName?: string | null
  description?: string | null
  color?: string | null
  textColor?: string | null
  /** Primary group id; comma-joined when the route spans several groups. */
  routeGroupId?: string | null
  /** All group ids — only present when the route belongs to more than one. */
  routeGroupIds?: string[]
  /** GTFS route_type. */
  type?: number | string | null
  mode: string
  agency?: Agency | null
  /** Present (true) only for headway-managed services. */
  headwayService?: boolean
  /** Present (true) only when the route is hidden from listings. */
  hidden?: boolean
  _path: string
}

export interface RouteGroup {
  id: string
  name?: string | null
  longName?: string | null
  description?: string | null
  color?: string | null
  textColor?: string | null
  mode?: string
  _path?: string
  [key: string]: unknown
}

export interface Headsign {
  headline?: string | null
  subtitle?: string | null
}

/**
 * Set/consist properties derived from the trip id (run number parsing).
 * The API merges parser output verbatim, so extra keys appear per feed.
 */
export interface ScheduledVehicleProperties {
  run_id?: string | null
  set?: string | null
  cars?: number | string | null
  aircon?: boolean | null
  setDisplayName?: string | null
  runNo?: string | null
  trainType?: string | null
  vehicleCategoryId?: string | null
  operator?: string | null
  commenceRegion?: string | null
  finishRegion?: string | null
  [key: string]: unknown
}

export interface Trip {
  id: string
  tripHash?: string
  rtTripId: string
  headsign?: Headsign | null
  shortName?: string | null
  directionId?: number | null
  shapeId?: string | null
  /** Numeric block *index* despite the name; the GTFS id is `srcBlockId`. */
  blockId?: string | number | null
  /** Source GTFS block_id string. */
  srcBlockId?: string | null
  wheelchair?: boolean | number | null
  routeDirection?: string | null
  route: RouteInfo
  /** YYYYMMDD service dates this trip runs on. */
  serviceDates?: string[]
  tripContinues?: boolean
  hasDeadRunning?: boolean
  nonRevenue?: boolean
  /** Stopping-pattern index; joins vehicles to schematic patterns */
  soPatternIndex?: number | null
  scheduledVehicleProperties?: ScheduledVehicleProperties | null
  _path: string
}

export interface TripInstance {
  trip: Trip
  /** Service date, YYYYMMDD (e.g. "20260710") */
  startDate: string
  instanceNumber: number
  /** 0 = scheduled, 1 = altered, 2 = added, 3 = cancelled; null when no
   * realtime state is known. */
  realtimeState?: number | null
  realtimeStatus?: number | null
  routeVariantKey?: string | null
  realtimeBlockId?: string | null
  tripContinues?: boolean
  shapeId?: string | null
  /** Unix seconds of the last realtime update (null when none yet). */
  time?: number | null
  current?: boolean
  /** Present (true) only when realtime added the whole trip. */
  added?: boolean
  /** Present (true) only when an override (altered) pattern applies. */
  altered?: boolean
  /** Whole service cancelled — drives strikethrough on departure rows. */
  cancelled?: boolean
  /** Delay offset in seconds applied to headway-managed services. */
  headwayOffset?: number
  /** Decorative emoji for special workings (e.g. heritage/track machine). */
  emoji?: string
  _path: string
}

/**
 * Surrounding stops on a vehicle position are stop-time entries (with
 * `_path` and `shapeDistance`), not bare stops.
 */
export interface SurroundingStops {
  prev?: StopTimeInstance | null
  at?: StopTimeInstance | null
  next?: StopTimeInstance | null
}

export interface VehiclePosition {
  /** Unix seconds */
  time: number
  bearing?: number | null
  speed?: number | null
  status?: number | null
  statusString?: string | null
  distance?: number | null
  locationId?: string | null
  vdap?: number | null
  coordinates: Coordinates
  surroundingStops?: SurroundingStops
  /** Delay in seconds interpolated along the shape */
  linearDelay?: number | null
  /** Per-carriage occupancy enums. */
  occupancy?: number[]
  /** Whole-vehicle GTFS occupancy enum. */
  vehicleOccupancy?: number | null
  /** Passenger count, when the feed reports one. */
  paxCount?: number | null
  /** Detailed RCS location metadata; only when enabled server-side. */
  sydneyTrains?: unknown
}

/**
 * Consist tree is one level deep: the parent carries id/name/_path, each
 * child carries only childSequence (+ front on section leaders).
 */
export interface VehicleConsist {
  id?: string
  name?: string | null
  /** Not emitted by the current API (legacy field). */
  label?: string | null
  /** 1-based position within the consist */
  childSequence?: number
  /** Leading carriage of a section */
  front?: boolean
  children?: VehicleConsist[]
  _path?: string
}

export interface VehicleInstance {
  id: string
  reportedTripId?: string | null
  lastPosition?: VehiclePosition | null
  /** Unix seconds the vehicle's trip assignment last reset. */
  lastResetTime?: number
  vehicleModel?: string | null
  consist?: VehicleConsist | null
  /** Wheelchair *space count* (TfNSW buses), not a GTFS enum. */
  wheelchair?: number | boolean | null
  aircon?: boolean | null
  current?: boolean
  /** Vehicle attribute flags — present (true) or absent, never false. */
  bikeRack?: boolean
  xmas?: boolean
  ddBus?: boolean
  artBus?: boolean
  evBus?: boolean
  hicapBus?: boolean
  hydrogenBus?: boolean
  /** Decorative emoji (e.g. EV/hydrogen/heritage markers). */
  emoji?: string | null
  _tripInstancePath?: string
  _path: string
}

/** Entry in the live map `vehicles` response. */
export interface VehicleEntry {
  tripInstance: TripInstance
  vehicleInstance: VehicleInstance
}

export interface StopTimeEvent {
  /** Unix seconds */
  time: number
  /** Delay in seconds (negative = early) */
  delay?: number | null
  /** Actual recorded time (unix seconds) — static-pattern variant only. */
  actual?: number | null
  /** Per-carriage occupancy enums. */
  occupancy?: number[]
  vehicleOccupancy?: number | null
  paxCount?: number | null
}

export interface StopTimeInstance {
  /** Null only on bundle-version skew (stop no longer in the dataset). */
  stop: Stop
  stopSequence: number
  /** Pre-alteration sequence when the pattern was renumbered. */
  originalStopSequence?: number
  index?: number
  /** Unix seconds reference timestamp */
  ts?: number
  arrival?: StopTimeEvent | null
  departure?: StopTimeEvent | null
  pickUp?: number | null
  dropOff?: number | null
  timepoint?: number | null
  firstStop?: boolean
  firstRevenueStop?: boolean
  lastStop?: boolean
  lastRevenueStop?: boolean
  skipped?: boolean
  added?: boolean
  /** Platform reassignment: this stop replaced the scheduled one. */
  replaced?: boolean
  /** The originally-scheduled stop when `replaced` is set. */
  scheduledStop?: Stop | null
  stopHeadsign?: Headsign | null
  /** Carriage positions that platform doors serve (short platforms) */
  boardingLocations?: number[]
  shapeDistance?: number | null
  _path?: string
}

/**
 * Entities an alert affects. Over-broad alerts are trimmed server-side:
 * routeGroups/routes empty out past 10 groups, stops past 10 stops.
 */
export interface AlertAffects {
  trips?: Trip[]
  routes?: RouteInfo[]
  routeGroups?: RouteGroup[]
  stops?: Stop[]
  agencies?: Agency[]
}

export interface Alert {
  id?: string
  /** Plain-text header (HTML sources are converted). */
  header?: string | null
  /** Original HTML header, only when the source was HTML. */
  headerHtml?: string | null
  description?: string | null
  /** Original HTML description, only when the source was HTML. */
  descriptionHtml?: string | null
  url?: string | null
  /** Currently within an active period */
  active?: boolean
  /** Alert was ended/withdrawn */
  cancelled?: boolean
  /** Unix seconds (sometimes serialised as a numeric string) */
  createdTime?: number | string
  /** Unix seconds the alert was last current at (= end time when cancelled) */
  currentAtTime?: number | string
  /** end is null for open-ended periods. */
  activePeriods?: Array<{ start?: number | null; end?: number | null }>
  affects?: AlertAffects
  /** Server-parsed trackwork semantics (bus replacements, suspensions). */
  parsedAffected?: unknown
  _path?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Endpoint responses (all wrapped in ApiEnvelope)
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  header?: { timestamp: number; apiVersion: number }
  request?: Record<string, unknown>
  response: T
}

/** Headway metrics on a departure row (headway-managed routes only). */
export interface DepartureHeadway {
  /** Scheduled forward headway, seconds. */
  scheduled?: number | null
  /** Scheduled headway in minutes. */
  scheduledMin?: number | null
  /** Observed forward headway, seconds. */
  actual?: number | null
  /** Gap implies a service was dropped without a cancellation message. */
  implicitlyCancelledService?: boolean
  /** Actual headway differs materially from scheduled. */
  changed?: boolean
}

export interface Departure {
  tripInstance: TripInstance
  vehicle?: VehicleInstance | null
  stopTimeInstance: StopTimeInstance
  /** Stop-times at the requested destination(s), present when the
   * departures request carried destinationStopIds. */
  destinations?: StopTimeInstance[]
  /** Only when the request set includeTripAlerts. */
  alerts?: Alert[]
  headway?: DepartureHeadway
  [key: string]: unknown
}

/**
 * Commuter car park / park&ride availability, delivered inline on the
 * departures response (there is no dedicated parking endpoint). Fields
 * match the legacy apps' `IParking`. `available` is null when there's no
 * real-time feed for the facility.
 */
export interface CarPark {
  /** Facility name, e.g. "Tallawong P1 Park&Ride". */
  name: string
  /** Total capacity. */
  total: number
  /** Spaces available; null/undefined when no real-time data. */
  available?: number | null
  /** Last-updated time (unix seconds). */
  time?: number
  /** 24 hourly occupancy values (index = hour of day), for the trend graph. */
  trend?: number[]
  /** One-line status, e.g. "Around 93 out of 123 car spaces left." */
  status?: string
  /** Longer blurb shown in the detail view. */
  summary?: string
  /** Extra info (legacy field — not emitted by the current API). */
  additionalInfo?: string
  isFull?: boolean
  isNearlyFull?: boolean
  /** "Learn more" link (legacy field — not emitted by the current API;
   * the UI falls back to the operator's park&ride page). */
  url?: string
}

export interface DeparturesResponse {
  stop: Stop
  childStops?: Stop[]
  /** Active children of the parent stop ([sic] — API misspells sibling). */
  sibilingStops?: Stop[]
  modes?: string[]
  /**
   * Index of the "now" boundary within this page's departures (equals
   * -offset): items before it are in the past relative to the request's
   * reference time (ts or the server clock).
   */
  nowAt?: number
  reachedEnd?: boolean
  reachedStart?: boolean
  departures: Departure[]
  alerts?: Alert[]
  /** First car park for the stop (suppressed by non-carpark mode filters). */
  parking?: CarPark | null
  carParks?: CarPark[]
  taxiRanks?: unknown
  /** PID URL (https://pid.anytrip.com.au/spi/<stopId>), NSW stops only. */
  pid?: string | null
}

export interface SearchStopResult {
  stop: Stop
  children?: Stop[]
  search?: { ref?: string; score?: number; routes?: unknown[] }
}

export interface SearchRouteGroupResult {
  routeGroup?: RouteGroup
  /** Only when the request set includeRoutes. */
  routes?: RouteInfo[]
  search?: { ref?: string; score?: number }
  [key: string]: unknown
}

export interface SearchTripInstanceResult {
  tripInstance: TripInstance
  vehicle?: VehicleInstance | null
  firstStop?: StopTimeInstance | null
  lastStop?: StopTimeInstance | null
  search?: { ref?: string; score?: number }
}

export interface SearchResponse {
  stops: SearchStopResult[]
  pois?: unknown[]
  tripInstances?: SearchTripInstanceResult[]
  routeGroups?: SearchRouteGroupResult[]
  count?: number
}

export interface VehiclesResponse {
  vehicles: VehicleEntry[]
}

export interface StopEntry {
  stop: Stop
  children?: Stop[]
  /** Live car-park availability for this stop (present on carpark-mode
   * queries) — a sibling of `stop`, not `stop.carParks`. */
  carParks?: CarPark[]
}

export interface StopsResponse {
  stops: StopEntry[]
}

/** Related (previous/next) trip of the same vehicle/block. */
export interface TripRel {
  tripInstance: TripInstance
  realtimePattern?: StopTimeInstance[]
  vehicle?: VehicleInstance | null
  rel?: {
    prev?: TripRel | null
    next?: TripRel | null
  }
}

export interface TripInstanceResponse {
  tripInstance: TripInstance
  /** Stopping pattern with realtime arrival/departure events */
  realtimePattern?: StopTimeInstance[]
  vehicle?: VehicleInstance | null
  alerts?: Alert[]
  /** Previous/next trips of the same vehicle/block */
  rel?: {
    prev?: TripRel | null
    next?: TripRel | null
  }
  /** Only when enabled. */
  historicalPerformance?: unknown
  historicalKey?: string
  [key: string]: unknown
}

export interface VehicleResponse {
  vehicle?: VehicleInstance | null
  positions?: VehiclePosition[]
  [key: string]: unknown
}

export interface AlertsResponse {
  alerts: Alert[]
}

export interface AlertResponse {
  alert: Alert
}

/** A trip altered by realtime (skipped/added/replaced stops). */
export interface TransposedTripInstance {
  tripInstance?: TripInstance
  firstStop?: StopTimeInstance | null
  lastStop?: StopTimeInstance | null
  /** The skipped/added/replaced stop-times (withheld for some feeds). */
  affectedStopTimes?: StopTimeInstance[]
  affectedStopTimesCount?: number
  vehicle?: VehicleInstance | null
  [key: string]: unknown
}

export interface TranspositionsResponse {
  transposedTripInstances?: TransposedTripInstance[]
  [key: string]: unknown
}

/** Timetable row on a special service (dep/arr in unix seconds). */
export interface SpecialServiceStop {
  stop: Stop
  /** Passes without picking up or setting down. */
  pass?: boolean
  dep?: number
  arr?: number
}

export interface SpecialService {
  setProperties?: ScheduledVehicleProperties | null
  /** Unix seconds. */
  departureTime?: number
  /** Unix seconds. */
  arrivalTime?: number
  tabled?: SpecialServiceStop[]
  /** tripInstance path for linking to the trip panel. */
  _path?: string
}

/** Services sharing a block, e.g. one loco working several legs. */
export interface SpecialServiceRunGroup {
  groupId?: string
  /** True on the synthetic "ungrouped" bucket. */
  ungrouped?: boolean
  services?: SpecialService[]
  setProperties?: ScheduledVehicleProperties | null
}

/** Special services grouped by class (e.g. "Charter", "Indian Pacific"). */
export interface SpecialServiceClass {
  class?: string
  runGroups?: SpecialServiceRunGroup[]
}

export interface SpecialServicesResponse {
  /** YYYYMMDD dates the loaded service data spans. */
  dates?: string[]
  specialServices?: SpecialServiceClass[]
  [key: string]: unknown
}

export interface RouteGroupResponse {
  routeGroup?: RouteGroup
  /** All routes in the group. */
  routes?: RouteInfo[]
  [key: string]: unknown
}
