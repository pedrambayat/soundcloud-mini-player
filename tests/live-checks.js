(() => {
  const host = document.createElement('div');
  host.id = 'sc-mini-live-checks';
  host.style.cssText = 'position:fixed;top:65px;right:25px;z-index:2147483647;width:340px;padding:15px;background:#202126;color:white;border:1px solid #777;border-radius:12px;font:12px/1.6 sans-serif';
  const title = document.createElement('strong'); title.textContent = 'SoundCloud Mini · Live checks';
  const start = document.createElement('button'); start.textContent = 'Run live checks';
  start.style.cssText = 'display:block;margin:10px 0;padding:7px 12px;background:#eee;color:#111;border:0;border-radius:5px';
  const result = document.createElement('pre'); result.style.cssText = 'white-space:pre-wrap;max-height:420px;overflow:auto;color:#ddd';
  host.append(title,start,result); document.documentElement.append(host);
  const q = s => document.querySelector(s);
  const delay = ms => new Promise(r => setTimeout(r,ms));
  const wait = async fn => { for(let i=0;i<30;i++){if(fn())return true;await delay(100);}return false; };
  const playing = () => q('.playControls__play')?.classList.contains('playing');
  const volume = () => Number(q('.volume__sliderWrapper')?.getAttribute('aria-valuenow'));
  const name = () => q('.playbackSoundBadge__titleLink')?.textContent.trim();
  const time = () => {const e=q('.playbackTimeline__timePassed');return SCMiniCore.parseTime(e?.querySelector('[aria-hidden="true"]')?.textContent || e?.textContent) || 0;};
  const duration = () => {const e=q('.playbackTimeline__duration');return SCMiniCore.parseTime(e?.querySelector('[aria-hidden="true"]')?.textContent || e?.textContent) || 0;};
  start.onclick = async () => {
    start.disabled = true; result.textContent = '';
    const log = (ok,text) => result.textContent += `${ok ? 'PASS' : 'FAIL'} ${text}\n`;
    const oldVolume = volume();
    const oldTime = time();
    const oldTitle = name();
    let ui;
    try {
      const launcher = q('#sc-mini-launcher')?.shadowRoot.querySelector('button');
      if (!documentPictureInPicture.window) launcher.click();
      if (!(await wait(()=>documentPictureInPicture.window?.document.body.children.length))) throw new Error('Pop-out did not open');
      const pip = documentPictureInPicture.window;
      ui = [...pip.document.body.children].find(e=>e.shadowRoot)?.shadowRoot;
      if (!ui) throw new Error('Player UI is missing');
      const $ = s=>ui.querySelector(s);
      log(!!$('.title').textContent && !$('.play').disabled,'Live metadata and controls available');
      log(await wait(()=>!$('.art img').hidden && $('.art img').naturalWidth>0),'Live SoundCloud artwork loads');
      if(playing()) $('.play').click();
      log(await wait(()=>!playing()),'Pause affects SoundCloud');
      $('.play').click(); log(await wait(()=>playing()),'Play affects SoundCloud');
      $('.play').click(); await wait(()=>!playing());
      $('.seek').value=500; $('.seek').dispatchEvent(new Event('change'));
      log(await wait(()=>Math.abs(time()-duration()/2)<3),'Seek reaches midpoint of real track');
      $('.level').value=30; $('.level').dispatchEvent(new Event('change'));
      log(await wait(()=>Math.abs(volume()-.3)<.03),'Volume reaches 30% on SoundCloud');
      $('.mute').click(); log(await wait(()=>volume()===0),'Mute affects SoundCloud');
      await delay(500); $('.mute').click(); log(await wait(()=>volume()>0),'Unmute affects SoundCloud');
      const before = name();
      if(!$('.next').disabled){
        $('.next').click(); log(await wait(()=>name()!==before),'Next changes the live track');
        await delay(500);
        $('.previous').click(); log(await wait(()=>name()===before),'Previous returns to the original track');
      } else result.textContent += 'SKIP Next/previous: queue has no next track\n';
      await delay(500);
      $('.level').value=Math.round(oldVolume*100); $('.level').dispatchEvent(new Event('change'));
      if(name()===oldTitle && duration()>0){$('.seek').value=Math.round(oldTime/duration()*1000);$('.seek').dispatchEvent(new Event('change'));}
      if(!playing()) $('.play').click();
      await wait(()=>playing());
      $('.hide').click();
      log(await wait(()=>!documentPictureInPicture.window),'Hide closes the pop-out');
      log(playing(),'Hide preserves real playback');
      if(playing()) q('.playControls__play').click();
      log(await wait(()=>!playing()),'Playback left paused');
      result.textContent += 'Finished. Reopen Mini-player to verify restoration.\n';
    } catch(error) {
      result.textContent += `ERROR ${error.message}\n`;
      if(playing()) q('.playControls__play').click();
    } finally { start.disabled=false; }
  };
})();
