// src/pages/AdminDashboard.jsx
import { useState } from "react";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const downloadSVG = () => {
    const svgEl = document.getElementById('adminSvg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if(!source.match(/^<svg[^>]+xmlns=\"http:\/\/www.w3.org\/2000\/svg\"/)){
      source = source.replace(/^<svg/, '<svg xmlns=\"http://www.w3.org/2000/svg\"');
    }
    const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'admin-dashboard.svg'; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
  };

  const openInNewTab = () => {
    const svgEl = document.getElementById('adminSvg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if(!source.match(/^<svg[^>]+xmlns=\"http:\/\/www.w3.org\/2000\/svg\"/)){
      source = source.replace(/^<svg/, '<svg xmlns=\"http://www.w3.org/2000/svg\"');
    }
    const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(source);
    window.open(url, '_blank');
  };

  return (
    <div style={{ margin: '18px', background: '#f4f6fb', minHeight: '100vh' }}>
      <h2 style={{ marginLeft: '230px' }}>Admin Dashboard</h2>
      
      {/* Sidebar */}
      <div 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '200px',
          height: '100vh',
          background: '#1e293b',
          padding: '20px 0'
        }}
      >
        <div style={{ padding: '0 32px 20px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
          SOLU-HMS
        </div>
        
        <nav style={{ padding: '0 32px' }}>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#f1f5f9', 
              padding: '10px 0', 
              cursor: 'pointer',
              backgroundColor: active === 'Dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Dashboard')}
          >
            🏠 Dashboard
          </div>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#f1f5f9', 
              padding: '10px 0', 
              cursor: 'pointer',
              backgroundColor: active === 'Tickets' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Tickets')}
          >
            🎟 Tickets
          </div>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#f1f5f9', 
              padding: '10px 0', 
              cursor: 'pointer',
              backgroundColor: active === 'Casuals' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Casuals')}
          >
            👷 Casuals
          </div>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#f1f5f9', 
              padding: '10px 0', 
              cursor: 'pointer',
              backgroundColor: active === 'Reports' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Reports')}
          >
            📊 Reports
          </div>
          <div 
            style={{ 
              fontSize: '14px', 
              color: '#f1f5f9', 
              padding: '10px 0', 
              cursor: 'pointer',
              backgroundColor: active === 'Settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Settings')}
          >
            ⚙ Settings
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '230px', maxWidth: '870px' }}>
        <div className="actions" style={{ marginBottom: '12px' }}>
          <button 
            onClick={downloadSVG}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '0', 
              background: '#16a34a', 
              color: 'white', 
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Download SVG
          </button>
          <button 
            onClick={openInNewTab}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '0', 
              background: '#1e3a8a', 
              color: 'white', 
              cursor: 'pointer' 
            }}
          >
            Open SVG in new tab
          </button>
          <p className="note" style={{ color: '#556', marginTop: '8px' }}>
            Tip: Use "Download SVG" to import into Canva or design tools.
          </p>
        </div>

        {/* Header */}
        <div 
          style={{ 
            width: '100%', 
            height: '64px', 
            borderRadius: '10px', 
            background: '#ffffff', 
            border: '1px solid #e6eefb',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            marginBottom: '30px'
          }}
        >
          <h1 style={{ fontSize: '22px', color: '#0f172a', fontWeight: 700, margin: 0 }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div 
            style={{ 
              width: '180px', 
              height: '90px', 
              borderRadius: '10px', 
              background: '#dcfce7', 
              border: '1px solid #bbf7d0',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
              Pending Tickets
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#166534' }}>
              14
            </div>
          </div>

          <div 
            style={{ 
              width: '180px', 
              height: '90px', 
              borderRadius: '10px', 
              background: '#fef9c3', 
              border: '1px solid #fde68a',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#854d0e', marginBottom: '8px' }}>
              Assigned
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#854d0e' }}>
              8
            </div>
          </div>

          <div 
            style={{ 
              width: '180px', 
              height: '90px', 
              borderRadius: '10px', 
              background: '#dbeafe', 
              border: '1px solid #bfdbfe',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', marginBottom: '8px' }}>
              Resolved
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a8a' }}>
              20
            </div>
          </div>
        </div>

        {/* Ticket list header */}
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
          All Tickets
        </div>

        {/* Tickets */}
        <div>
          {/* Ticket 1 */}
          <div 
            style={{ 
              width: '100%', 
              height: '68px', 
              borderRadius: '8px', 
              background: '#fff', 
              border: '1px solid #e5e7eb',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                #T-001 — Radiology — X-ray machine sparks
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Status: Pending
              </div>
            </div>
            <button 
              style={{ 
                width: '140px', 
                height: '32px', 
                borderRadius: '6px', 
                background: '#16a34a', 
                color: '#fff', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Assign Casual
            </button>
          </div>

          {/* Ticket 2 */}
          <div 
            style={{ 
              width: '100%', 
              height: '68px', 
              borderRadius: '8px', 
              background: '#fff', 
              border: '1px solid #e5e7eb',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                #T-002 — Surgery — Broken ceiling light
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Status: Assigned to Casual B
              </div>
            </div>
            <button 
              style={{ 
                width: '140px', 
                height: '32px', 
                borderRadius: '6px', 
                background: '#eab308', 
                color: '#fff', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reassign
            </button>
          </div>

          {/* Ticket 3 */}
          <div 
            style={{ 
              width: '100%', 
              height: '68px', 
              borderRadius: '8px', 
              background: '#fff', 
              border: '1px solid #e5e7eb',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                #T-003 — Lab — Water leakage
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Status: Resolved
              </div>
            </div>
            <div style={{ width: '140px' }}></div>
          </div>
        </div>

        {/* Hidden SVG for download */}
        <div style={{ display: 'none' }}>
          <svg id="adminSvg" width="1100" height="700" viewBox="0 0 1100 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
            <title id="title">Admin Dashboard</title>
            <desc id="desc">Admin dashboard with sidebar navigation, ticket assignments, and task tracking.</desc>

            <rect x="0" y="0" width="1100" height="700" fill="#f4f6fb" />

            {/* Sidebar */}
            <rect x="0" y="0" width="200" height="700" fill="#1e293b" />
            <text x="32" y="60" font-size="18" fill="#f1f5f9" font-weight="700">SOLU-HMS</text>

            {/* Nav items */}
            <text x="32" y="120" font-size="14" fill="#f1f5f9">🏠 Dashboard</text>
            <text x="32" y="160" font-size="14" fill="#f1f5f9">🎟 Tickets</text>
            <text x="32" y="200" font-size="14" fill="#f1f5f9">👷 Casuals</text>
            <text x="32" y="240" font-size="14" fill="#f1f5f9">📊 Reports</text>
            <text x="32" y="280" font-size="14" fill="#f1f5f9">⚙ Settings</text>

            {/* Header */}
            <rect x="210" y="20" width="870" height="64" rx="10" fill="#ffffff" stroke="#e6eefb" />
            <text x="234" y="58" font-size="22" fill="#0f172a" font-weight="700">Admin Dashboard</text>

            {/* Summary cards */}
            <rect x="230" y="110" width="180" height="90" rx="10" fill="#dcfce7" stroke="#bbf7d0"/>
            <text x="246" y="140" font-size="13" font-weight="600" fill="#166534">Pending Tickets</text>
            <text x="246" y="170" font-size="22" font-weight="700" fill="#166534">14</text>

            <rect x="430" y="110" width="180" height="90" rx="10" fill="#fef9c3" stroke="#fde68a"/>
            <text x="446" y="140" font-size="13" font-weight="600" fill="#854d0e">Assigned</text>
            <text x="446" y="170" font-size="22" font-weight="700" fill="#854d0e">8</text>

            <rect x="630" y="110" width="180" height="90" rx="10" fill="#dbeafe" stroke="#bfdbfe"/>
            <text x="646" y="140" font-size="13" font-weight="600" fill="#1e3a8a">Resolved</text>
            <text x="646" y="170" font-size="22" font-weight="700" fill="#1e3a8a">20</text>

            {/* Ticket list header */}
            <text x="230" y="240" font-size="16" font-weight="700" fill="#0f172a">All Tickets</text>

            {/* Tickets */}
            <g>
              <rect x="230" y="260" width="830" height="68" rx="8" fill="#fff" stroke="#e5e7eb"/>
              <text x="254" y="292" font-size="14" font-weight="600" fill="#0f172a">#T-001 — Radiology — X-ray machine sparks</text>
              <text x="254" y="312" font-size="12" fill="#6b7280">Status: Pending</text>
              <rect x="900" y="276" width="140" height="32" rx="6" fill="#16a34a"/>
              <text x="920" y="298" font-size="13" fill="#fff">Assign Casual</text>

              <rect x="230" y="340" width="830" height="68" rx="8" fill="#fff" stroke="#e5e7eb"/>
              <text x="254" y="372" font-size="14" font-weight="600" fill="#0f172a">#T-002 — Surgery — Broken ceiling light</text>
              <text x="254" y="392" font-size="12" fill="#6b7280">Status: Assigned to Casual B</text>
              <rect x="900" y="356" width="140" height="32" rx="6" fill="#eab308"/>
              <text x="920" y="378" font-size="13" fill="#fff">Reassign</text>

              <rect x="230" y="420" width="830" height="68" rx="8" fill="#fff" stroke="#e5e7eb"/>
              <text x="254" y="452" font-size="14" font-weight="600" fill="#0f172a">#T-003 — Lab — Water leakage</text>
              <text x="254" y="472" font-size="12" fill="#6b7280">Status: Resolved</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}