

// مزامنة الأعمال التي أضيفت من لوحة المعاينة المحلية في نفس المتصفح.
async function syncLocalAdminProjects(){
  try{
    const saved=JSON.parse(localStorage.getItem('abu-jabir-local-projects')||'[]');
    if(!saved.length)return;
    const byId=new Map(PROJECT_MANIFEST.projects.map(p=>[p.id,p]));
    saved.forEach(p=>byId.set(p.id,{id:p.id,image:p.imageUrl||p.image,title:p.title,category:p.categoryName||p.category||'أعمال متنوعة',description:p.description||'',published:Boolean(p.published)}));
    const merged=[...byId.values()];
    allProjects=merged.filter(p=>p.published);
    visibleProjects=allProjects;
    renderFilters(merged);
    renderProjects();
    document.getElementById('projectCount').textContent=allProjects.length;
    document.getElementById('countLabel').textContent=`${allProjects.length} صورة من الأعمال المنشورة`;
  }catch(error){console.warn('Local admin sync unavailable',error)}
}
setTimeout(syncLocalAdminProjects,500);
