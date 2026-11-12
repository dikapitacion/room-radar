import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Clock, Zap, Monitor, 
  Users, CheckCircle2, AlertCircle, Compass, 
  Sparkles, Coffee, Navigation, ChevronRight, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ROOM_DATABASE = [
  {
    id: 'B2-301',
    building: 'Academic Block 2',
    floor: '3rd Floor',
    capacity: 60,
    hasProjector: true,
    outlets: 'Abundant (Every Row)',
    hasWhiteboard: true,
    acStatus: 'Cool & Active',
    schedule: [
      { start: 9, end: 11, course: 'ECE201: Signals & Systems' },
      { start: 14, end: 16, course: 'CS302: Operating Systems Lab' }
    ]
  },
  {
    id: 'CS-L4',
    building: 'CS Department Wing',
    floor: 'Ground Floor',
    capacity: 45,
    hasProjector: true,
    outlets: 'Abundant (Lab Desks)',
    hasWhiteboard: true,
    acStatus: 'Optimal (21°C)',
    schedule: [
      { start: 10, end: 13, course: 'Advanced Algorithms Practical' },
      { start: 16, end: 18, course: 'Compiler Design Tutorial' }
    ]
  },
  {
    id: 'TS-104',
    building: 'Tutorial Block C',
    floor: '1st Floor',
    capacity: 35,
    hasProjector: false,
    outlets: 'Moderate (Wall Sockets)',
    hasWhiteboard: true,
    acStatus: 'Breezy / Natural Air',
    schedule: [
      { start: 8, end: 10, course: 'ENG101: Technical Comms' },
      { start: 12, end: 14, course: 'Math IV Tutorial Group A' }
    ]
  },
  {
    id: 'AUD-SEM2',
    building: 'Main Auditorium Complex',
    floor: '2nd Floor',
    capacity: 80,
    hasProjector: true,
    outlets: 'Limited (Front/Back)',
    hasWhiteboard: false,
    acStatus: 'Cool & Active',
    schedule: [
      { start: 11, end: 13, course: 'Guest Lecture Series' }
    ]
  },
  {
    id: 'MECH-W2',
    building: 'Polytechnic North Wing',
    floor: '1st Floor',
    capacity: 40,
    hasProjector: false,
    outlets: 'Abundant (Workbenches)',
    hasWhiteboard: true,
    acStatus: 'Standard Fan',
    schedule: [
      { start: 13, end: 15, course: 'Applied CAD/CAM Session' }
    ]
  }
];

export default function App() {
  const [selectedHour, setSelectedHour] = useState(13); // 1:00 PM default
  const [filterBuilding, setFilterBuilding] = useState('All');
  const [reqProjector, setReqProjector] = useState(false);
  const [reqOutlets, setReqOutlets] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(ROOM_DATABASE[0]);
  const [activeCheckins, setActiveCheckins] = useState(() => {
    const saved = localStorage.getItem('roomradar_checkins');
    return saved ? JSON.parse(saved) : { 'B2-301': 3 };
  });

  useEffect(() => {
    localStorage.setItem('roomradar_checkins', JSON.stringify(activeCheckins));
  }, [activeCheckins]);

  // Determine vacancy status based on time scrubber
  const getRoomStatus = (room, hour) => {
    const conflict = room.schedule.find(s => hour >= s.start && hour < s.end);
    if (conflict) {
      return {
        isFree: false,
        occupiedBy: conflict.course,
        freeAt: `${conflict.end > 12 ? conflict.end - 12 : conflict.end}:00 ${conflict.end >= 12 ? 'PM' : 'AM'}`
      };
    }
    // Find next upcoming class
    const nextClass = room.schedule.filter(s => s.start > hour).sort((a, b) => a.start - b.start)[0];
    const freeUntil = nextClass 
      ? `${nextClass.start > 12 ? nextClass.start - 12 : nextClass.start}:00 ${nextClass.start >= 12 ? 'PM' : 'AM'}` 
      : 'End of Day (8:00 PM)';

    return {
      isFree: true,
      freeUntil,
      nextCourse: nextClass ? nextClass.course : 'None scheduled'
    };
  };

  const handleCheckIn = (roomId) => {
    setActiveCheckins(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1
    }));
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.7 } });
  };

  const filteredRooms = ROOM_DATABASE.filter(r => {
    if (filterBuilding !== 'All' && r.building !== filterBuilding) return false;
    if (reqProjector && !r.hasProjector) return false;
    if (reqOutlets && !r.outlets.includes('Abundant')) return false;
    return true;
  });

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : h;
    return `${hour12}:00 ${ampm}`;
  };

  const selectedRoomStatus = getRoomStatus(selectedRoom, selectedHour);

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', background: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>RoomRadar</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Empty Classroom & Power Outlet Finder</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0369a1', color: '#e0f2fe', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
          <Sparkles size={14} /> Real-Time Schedule Synced
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Column: Interactive Timeline Scrubber & Room Directory */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Timeline Scrubber Card */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Study Window
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0 0 0' }}>
                  Scanning Campus at {formatHour(selectedHour)}
                </h3>
              </div>
              <span style={{ fontSize: '12px', background: '#1e293b', color: '#93c5fd', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
                {filteredRooms.filter(r => getRoomStatus(r, selectedHour).isFree).length} Rooms Vacant
              </span>
            </div>

            <input
              type="range"
              min={8}
              max={18}
              step={1}
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              <span>8:00 AM</span>
              <span>11:00 AM</span>
              <span>1:00 PM</span>
              <span>3:00 PM</span>
              <span>6:00 PM</span>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {['All', 'Academic Block 2', 'CS Department Wing', 'Tutorial Block C'].map(b => (
              <button
                key={b}
                onClick={() => setFilterBuilding(b)}
                style={{
                  background: filterBuilding === b ? '#0284c7' : '#1e293b',
                  color: filterBuilding === b ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {b}
              </button>
            ))}

            <button
              onClick={() => setReqOutlets(!reqOutlets)}
              style={{
                background: reqOutlets ? '#10b981' : '#1e293b',
                color: reqOutlets ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={13} /> Plenty of Sockets
            </button>

            <button
              onClick={() => setReqProjector(!reqProjector)}
              style={{
                background: reqProjector ? '#10b981' : '#1e293b',
                color: reqProjector ? '#ffffff' : '#94a3b8',
                border: '1px solid #334155',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Monitor size={13} /> Projector / Screen
            </button>
          </div>

          {/* Room Directory Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {filteredRooms.map(room => {
              const status = getRoomStatus(room, selectedHour);
              const isSelected = selectedRoom.id === room.id;
              const occupants = activeCheckins[room.id] || 0;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    background: isSelected ? '#1e293b' : '#0f172a',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: status.isFree ? '#064e3b' : '#7f1d1d',
                      color: status.isFree ? '#6ee7b7' : '#fca5a5'
                    }}>
                      {status.isFree ? 'VACANT & READY' : 'CLASS IN SESSION'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {room.capacity} seats
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0 2px 0', color: '#f8fafc' }}>
                    {room.id}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 10px 0' }}>
                    {room.building} · {room.floor}
                  </p>

                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '8px', fontSize: '12px' }}>
                    {status.isFree ? (
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        Free until {status.freeUntil}
                      </span>
                    ) : (
                      <span style={{ color: '#f87171' }}>
                        {status.occupiedBy} (until {status.freeAt})
                      </span>
                    )}
                  </div>

                  {occupants > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8', marginTop: '6px' }}>
                      <Users size={12} /> {occupants} student{occupants > 1 ? 's' : ''} studying here now
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Room Inspector & Check-In Hub */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Selected Space Overview
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 12px 0' }}>{selectedRoom.id}</h2>

            {/* Status Highlight Banner */}
            <div style={{
              background: selectedRoomStatus.isFree ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: selectedRoomStatus.isFree ? '1px solid #10b981' : '1px solid #ef4444',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: selectedRoomStatus.isFree ? '#10b981' : '#f87171' }}>
                {selectedRoomStatus.isFree ? 'Available for Study & Project Work' : 'Currently Occupied by Lecture'}
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                {selectedRoomStatus.isFree 
                  ? `Next class scheduled: ${selectedRoomStatus.nextCourse} at ${selectedRoomStatus.freeUntil}`
                  : `Course: ${selectedRoomStatus.occupiedBy} (Class clears at ${selectedRoomStatus.freeAt})`
                }
              </p>
            </div>

            {/* Room Features Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#030712', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Power Sockets:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedRoom.outlets}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Climate / AC:</span>
                <span style={{ color: '#38bdf8' }}>{selectedRoom.acStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Whiteboard:</span>
                <span style={{ color: selectedRoom.hasWhiteboard ? '#10b981' : '#94a3b8' }}>
                  {selectedRoom.hasWhiteboard ? '✓ Full Wall Board' : 'None'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>HDMI Projector:</span>
                <span style={{ color: selectedRoom.hasProjector ? '#10b981' : '#94a3b8' }}>
                  {selectedRoom.hasProjector ? '✓ Ready / Unlocked' : 'None'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedRoomStatus.isFree && (
              <button
                onClick={() => handleCheckIn(selectedRoom.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} /> I'm Studying Here (+1 Peer Occupancy)
              </button>
            )}
          </div>

          {/* Quiet Study Protocol Card */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0', color: '#cbd5e1' }}>Classroom Etiquette Protocol</h3>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Vacate promptly 5 minutes before the next scheduled class start time.</li>
              <li>Please clean up whiteboards and dispose of food or drink cups before leaving.</li>
              <li>Keep ambient volume low so neighboring lectures are not disturbed.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}