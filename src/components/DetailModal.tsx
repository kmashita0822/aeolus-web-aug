import React from 'react'

const DetailModal: React.FC = () => {
  return (
    <div className="detail-modal" id="detailModal" role="dialog" aria-modal="true" aria-labelledby="detailTitle" aria-describedby="detailDescription" tabIndex={-1}>
      <div className="detail-content">
        <div className="detail-header">
          <div className="detail-title" id="detailTitle"></div>
          <div className="detail-meta" id="detailMeta"></div>
        </div>
        <div className="detail-body">
          <div className="detail-description" id="detailDescription"></div>
          <div className="detail-info" id="detailInfo"></div>
        </div>
        {/* Close button for detail modal */}
        <button className="detail-close-btn" aria-label="Close detail view" tabIndex={0}>✕</button>
      </div>
    </div>
  )
}

export default DetailModal 