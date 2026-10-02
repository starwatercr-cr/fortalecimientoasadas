(() => {
 const video=document.getElementById('hero-water-video');
 if(!video)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let inView=true,failed=false;
 video.muted=true;
 function sync(){
  if(reduced.matches||!inView||document.hidden||failed){video.pause();return;}
  const play=video.play();if(play&&play.catch)play.catch(()=>{failed=true;video.pause();});
 }
 document.addEventListener('visibilitychange',sync);
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:0.05}).observe(video);}
 if(reduced.addEventListener)reduced.addEventListener('change',sync);
 sync();
})();
