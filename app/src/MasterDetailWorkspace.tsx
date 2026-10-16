import React from 'react';
/** Keep the results subtree mounted so selecting another record preserves its scroll. */
export function MasterDetailWorkspace({detail,children}:{detail:React.ReactNode;children:React.ReactNode}){
 return <div className={detail?'browse-workspace expanded':'browse-workspace'}>{detail&&<div className="browse-detail-column">{detail}</div>}<div className="browse-results" aria-label="Catalog results">{children}</div></div>;
}
