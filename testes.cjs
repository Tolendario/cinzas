// Execute npm test nesta pasta ou node cinzas/testes.cjs a partir do workspace.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const playwrightPath=(()=>{try{return require.resolve('playwright')}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;return require.resolve('../portal-jurassico-testes/node_modules/playwright')}})();
const { chromium } = require(playwrightPath);
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
new Function(script);
const testApi = `
globalThis.T = {
 get state(){return state}, get player(){return player}, get enemies(){return enemies},
 get projectiles(){return projectiles},get wave(){return wave},get portal(){return portal},
 get save(){return save},get runAsh(){return runAsh},get gold(){return gold},get room(){return room},
 get boons(){return boons},get zones(){return zones},get dashCooldowns(){return dashCooldowns},
 get stages(){return stages},get creatures(){return creatures},get pillars(){return pillars},
 get classes(){return classes},get selectedClass(){return selectedClass},selectClass,
 get weapons(){return weapons},get selectedWeapons(){return selectedWeapons},selectWeapon,equippedWeapon,
 get equipment(){return equipment},get gearBonus(){return gearBonus},get gearTimers(){return gearTimers},get chest(){return chest},get chestClaimed(){return chestClaimed},get modalHandler(){return modalHandler},get pickups(){return pickups},
 get talentPaths(){return talentPaths},get companions(){return companions},get traps(){return traps},get talentTimers(){return talentTimers},
 get encounter(){return encounter},get crystal(){return crystal},get objectivesWon(){return objectivesWon},get perfectRooms(){return perfectRooms},
 get kills(){return kills},campaignFor,completedLevels,commitBossCheckpoint,backToMenu,
 get trainingMode(){return trainingMode},get trainingSession(){return trainingSession},get refugeAvatar(){return refugeAvatar},
 openRefuge,leaveRefuge,departRefuge,openRefugeStation,closeRefugePanel,setRefugeClass,startTraining,leaveTraining,resetTrainingTargets,
 refugeClass,refugeMissions,claimRefugeMission,forgeRefugeWeapon,selectRefugeSkin,isWeaponUnlocked,refugeRelics,
 resetRefuge(){delete save.refuge;initRefugeSave();persist()},
 seedRefuge(id,bosses=0,damage=0){const d=refugeClass(id);d.bestBosses=bosses;d.trainingDamage=damage;d.actions={special:true,cast:true,dash:true};persist()},
 resetCampaigns(){for(const id of Object.keys(classes))save.campaigns[id]={clearedRealms:0,wins:0,checkpoint:null};persist()},
 get roomEvent(){return roomEvent},get eventBonus(){return eventBonus},get eventStats(){return eventStats},
 prepareRoomEvent,updateRoomEvent,eventOffers,openRoomEvent,tryRoomEvent,enterSecretRoom,leaveSecretRoom,eventInteraction,
 nextRoom,openRoute,clearRunGear,realms,prepareEncounter,damageCrystal,completeEncounter,grantEncounterReward,spawnWave,enemyShot,
 openTalents,closeTalents,learnTalent,activateSpecialization,awardClassXp,hasTalent,talentAction,
 offerBlessing,applyWeaponEffect,castMultiplier,
 resetMastery(){for(const id of Object.keys(classes)){save.mastery[id]={level:1,xp:0,points:1,learned:[]};save.specializations[id]=null}persist();renderMasteryHud()},
 masterySetup(classId,path,ids){save.mastery[classId]={level:6,xp:0,points:6-ids.length,learned:[...ids]};save.specializations[classId]=path;persist();renderMasteryHud()},
 rollGear,addGear,openInventory,closeInventory,openChest,ensureChest,dropGear,killEnemy,
 advance(seconds){for(let t=0;t<seconds;t+=.016)update(.016);render()},
 startRun,attack,dash,special,cast,takeDamage,spawnEnemy,hitEnemy,finishRun,pauseGame,
 showHelp,render, getAim,
 setupRoom(n){room=n;enterRoom()},
 clearEnemies(){for(const e of enemies)if(!e.dead)killEnemy(e)},
 isolate(){enemies=[];pots=[];projectiles=[];zones=[];wave=0;spawnTimer=-1;portal=false;player.invuln=0;if(chest)chest.claimed=true;prepareEncounter('combat')},
 completeCurrentEncounter(){player.invuln=100;for(let tick=0;tick<4000&&state==='playing'&&!portal;tick++){if(tick%12===0)for(const e of [...enemies])if(!e.dead)killEnemy(e);update(.016)}render()},
 aim(x,y){aimWithMouse=true;mouse.x=x;mouse.y=y},
 teleport(x,y){player.x=x;player.y=y},
 setGold(n){gold=n},offerShop,
 setHazardClock(n){hazardClock=n},
 visibleBodyPixels(type){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,220,220);drawRealmEnemy({type,x:100,y:150,radius:creatures[type].radius,id:0,dir:0,wind:0,charge:0,flash:0,burn:0,hp:100,maxHp:100});const pixels=ctx.getImageData(30,20,140,110).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>50)visible++;ctx.restore();return visible},
 setKeys(value){keys=value},
 setPots(value){pots=value},
};
`;
const testHtml = html.replace(script, script.replaceAll('requestAnimationFrame(frame)', '/* RAF disabled only in fixture */').replace(/\}\)\(\);\s*$/, testApi + '})();'));
let passed=0;
async function check(name,action){if(process.argv.includes('--celular')&&!name.includes('celular'))return;if(process.argv.includes('--refugio')&&!name.startsWith('refúgio:'))return;await action();console.log('OK',name);passed++}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_BROWSER_CHANNEL?{channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL}:process.platform==='win32'?{channel:'msedge'}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await check('HTML offline inicia o combate sem baú ou escolha obrigatória',async()=>{
  await page.goto(pathToFileURL(htmlPath).href);await page.locator('#start').waitFor();
  assert.match(await page.locator('.intro-meta').innerText(),/11 REINOS/);
  await page.screenshot({path:path.join(__dirname,'previa-inicio.png')});
  await page.locator('#start').click();await page.waitForTimeout(150);
  assert.equal(await page.locator('#hud').isVisible(),true);
  await page.keyboard.press('e');assert.equal(await page.locator('#modal').isVisible(),false);
  await page.waitForTimeout(1400);assert.match(await page.locator('#encounterDetail').innerText(),/Onda 1 \/ 2/);
  await page.screenshot({path:path.join(__dirname,'previa-combate.png')});
 });
 await context.route('https://cinzas.test/**',route=>route.fulfill({contentType:'text/html',body:testHtml}));
 await page.goto('https://cinzas.test');
 async function start(room=0,classId='warrior',weaponId=null){await page.evaluate(({room,classId,weaponId})=>T.startRun(room,classId,weaponId),{room,classId,weaponId})}
 async function choose(index=0){await page.evaluate(()=>T.teleport(T.chest.x,T.chest.y));await page.keyboard.press('e');await page.locator(`[data-choice="${index}"]`).click();assert.equal(await page.evaluate(()=>T.state),'playing')}
 async function bossReward(room=5){await start(room);await page.evaluate(()=>T.completeCurrentEncounter());if(await page.evaluate(()=>T.state==='blessing'))await page.keyboard.press('1')}
 await check('11 temáticas mantêm cinco níveis de duas ondas seguidos de um chefe próprio',async()=>{
  const result=await page.evaluate(()=>T.realms.map((r,i)=>{const block=T.stages.slice(i*6,i*6+6);return{theme:block.map(s=>s.theme||'underworld'),bosses:block.map(s=>!!s.boss),indices:block.map(s=>s.roomInRealm),boss:block[5].boss,name:block[5].bossName}}));
  assert.equal(result.length,11);assert.equal(new Set(result.map(r=>r.boss)).size,11);assert.equal(new Set(result.map(r=>r.name)).size,11);
  for(const r of result){assert.equal(new Set(r.theme).size,1);assert.deepEqual(r.bosses,[false,false,false,false,false,true]);assert.deepEqual(r.indices,[0,1,2,3,4,5])}
 });
 await check('nível inicia com três espaços vazios e combate automático, sem mochila',async()=>{
  await start();const r=await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4);return{count:Object.values(T.equipment).filter(Boolean).length,wave:T.wave,enemies:T.enemies.length,chest:T.chest}});assert.equal(r.count,0);assert.equal(r.wave,1);assert.ok(r.enemies>0);assert.equal(r.chest,null);assert.equal(await page.locator('#inventoryCount').count(),0);
 }); await check('limpar as duas ondas de qualquer nível normal não gera baú',async()=>{
  for(let realm=0;realm<11;realm++)for(let level=0;level<5;level++){
   await start(realm*6+level);await page.evaluate(()=>T.completeCurrentEncounter());
   assert.equal(await page.evaluate(()=>T.state),'blessing');assert.equal(await page.evaluate(()=>T.wave),2);assert.equal(await page.evaluate(()=>T.chest),null);
   await page.keyboard.press('1');await page.evaluate(()=>{T.ensureChest();T.advance(.1)});assert.equal(await page.evaluate(()=>T.chest),null);
  }
 });
 await check('baú só aparece quando o chefe morre, inclusive no último reino',async()=>{
  for(let realm=0;realm<11;realm++){
   await start(realm*6+5);const info=await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4);T.ensureChest();const before=T.chest;const boss=T.enemies.find(e=>e.type==='boss');T.killEnemy(boss);const first=T.chest;T.killEnemy(boss);T.ensureChest();return{before,after:!!first,same:first===T.chest,completed:T.encounter.completed}});
   assert.deepEqual(info,{before:null,after:true,same:true,completed:true});
  }
 });
 await check('baú oferece exatamente três opções depois do chefe',async()=>{
  await bossReward();await page.evaluate(()=>T.teleport(800,520));await page.keyboard.press('e');
  assert.equal(await page.evaluate(()=>T.state),'chestChoice');assert.equal(await page.locator('.chest-choices [data-choice]').count(),3);
  assert.deepEqual(await page.evaluate(()=>T.chest.offers.map(i=>i.slot)),['armor','ring','amulet']);
  await page.screenshot({path:path.join(__dirname,'previa-bau.png')});
 });
 await check('escolha pausa a partida e não pode ser desviada para ajuda ou inventário',async()=>{
  const before=await page.evaluate(()=>({wave:T.wave,hp:T.player.hp,offers:T.chest.offers.map(i=>i.uid)}));
  await page.keyboard.press('h');await page.keyboard.press('i');await page.keyboard.press('Escape');await page.evaluate(()=>T.advance(15));
  assert.equal(await page.evaluate(()=>T.state),'chestChoice');assert.deepEqual(await page.evaluate(()=>({wave:T.wave,hp:T.player.hp,offers:T.chest.offers.map(i=>i.uid)})),before);
 });
 await check('baú equipa só a escolha, desaparece e bloqueia duplicação',async()=>{
  const uid=await page.evaluate(()=>{window.staleChestChoice=T.modalHandler;return T.chest.offers[1].uid});await page.keyboard.press('2');assert.equal(await page.evaluate(()=>T.state),'playing');
  assert.equal(await page.evaluate(()=>T.equipment.ring.uid),uid);assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),1);
  const r=await page.evaluate(()=>{window.staleChestChoice(0);for(let i=0;i<10;i++)T.ensureChest();T.advance(4);T.render();return{chest:T.chest,open:T.openChest(),count:Object.values(T.equipment).filter(Boolean).length,wave:T.wave}});assert.deepEqual(r,{chest:null,open:false,count:1,wave:1});
 }); await check('duas ondas normais sem terceiro grupo ou baú no portal',async()=>{
  await start();await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4)});assert.equal(await page.evaluate(()=>T.wave),1);
  await page.evaluate(()=>{T.clearEnemies();T.advance(2.6)});assert.equal(await page.evaluate(()=>T.wave),2);assert.equal(await page.evaluate(()=>T.state),'playing');
  await page.evaluate(()=>{T.clearEnemies();T.advance(1.3)});assert.equal(await page.evaluate(()=>T.state),'blessing');await page.keyboard.press('1');
  assert.equal(await page.evaluate(()=>T.portal),true);assert.equal(await page.evaluate(()=>T.chest),null);
 });
 await check('escolher um novo item substitui o anterior sem guardar, vender ou acumular bônus',async()=>{
  await start();const r=await page.evaluate(()=>{T.isolate();const a=T.rollGear('enemy',0,'hunter'),b=T.rollGear('enemy',2,'precision');T.addGear(a,false);const gold=T.gold;T.addGear(b,false);T.openInventory();return{newItem:T.equipment.ring.uid===b.uid,oldGone:!Object.values(T.equipment).some(i=>i?.uid===a.uid),count:Object.values(T.equipment).filter(Boolean).length,attack:T.gearBonus.attack,expected:b.stats.attack,gold:T.gold===gold}});
  assert.equal(r.newItem,true);assert.equal(r.oldGone,true);assert.equal(r.count,1);assert.equal(r.attack,r.expected);assert.equal(r.gold,true);assert.equal(await page.locator('.bag-item,.gear-bag,[data-gear-equip],[data-gear-unequip],[data-gear-sell]').count(),0);await page.screenshot({path:path.join(__dirname,'previa-equipamentos.png')});await page.keyboard.press('i');
 }); await check('substituição de armadura remove o bônus antigo e não restaura vida',async()=>{
  const r=await page.evaluate(()=>{T.startRun(0);T.isolate();const base=T.player.maxHp,a=T.rollGear('enemy',2,'obsidian'),b=T.rollGear('enemy',0,'windcloak');T.player.hp=50;T.addGear(a,false);const hp=T.player.hp;T.addGear(b,false);return{hp,after:T.player.hp,max:T.player.maxHp,expected:base+b.stats.health}});assert.equal(r.hp,50);assert.equal(r.after,50);assert.equal(r.max,r.expected);
 }); await check('equipamentos e bônus permanecem ao atravessar o portal',async()=>{
  const before=await page.evaluate(()=>{T.startRun(0);T.isolate();for(const id of ['obsidian','hunter','astral'])T.addGear(T.rollGear('enemy',1,id),false);const r={max:T.player.maxHp,equipped:Object.values(T.equipment).map(i=>i.uid),bonus:{...T.gearBonus}};T.openRoute();return r});const snapshot=()=>page.evaluate(()=>({max:T.player.maxHp,equipped:Object.values(T.equipment).map(i=>i.uid),bonus:{...T.gearBonus}}));assert.deepEqual(await snapshot(),before);await page.keyboard.press('2');assert.equal(await page.evaluate(()=>T.room),1);assert.deepEqual(await snapshot(),before);
 }); await check('equipamento escolhido no baú acompanha a mudança de temática',async()=>{
  await bossReward();await page.evaluate(()=>T.teleport(800,520));await page.keyboard.press('e');const uid=await page.evaluate(()=>T.chest.offers[0].uid);await page.keyboard.press('1');const max=await page.evaluate(()=>T.player.maxHp);await page.evaluate(()=>T.teleport(800,300));await page.keyboard.press('e');await page.keyboard.press('2');assert.equal(await page.evaluate(()=>T.room),6);assert.equal(await page.evaluate(()=>T.equipment.armor.uid),uid);assert.equal(await page.evaluate(()=>T.player.maxHp),max);
 }); await check('morte limpa os três equipamentos e bônus, preservando maestria e cinzas',async()=>{
  const r=await page.evaluate(()=>{T.resetCampaigns();T.startRun(0);T.isolate();for(const id of ['obsidian','hunter','astral'])T.addGear(T.rollGear('enemy',1,id),false);T.killEnemy(T.spawnEnemy('shade',500,500));const ash=T.save.ash,earned=T.runAsh,mastery=JSON.stringify(T.save.mastery),base=T.player.maxHp-(T.gearBonus.health||0);T.player.invuln=0;T.takeDamage(99999);return{state:T.state,count:Object.values(T.equipment).filter(Boolean).length,max:T.player.maxHp,base,ash:T.save.ash===ash+earned,mastery:JSON.stringify(T.save.mastery)===mastery}});assert.equal(r.state,'result');assert.equal(r.count,0);assert.equal(r.max,r.base);assert.equal(r.ash,true);assert.equal(r.mastery,true);
 }); await check('reiniciar sem chefes salvos começa vazio e sem baú',async()=>{
  await page.locator('[data-choice="1"]').click();assert.deepEqual(await page.evaluate(()=>({state:T.state,count:Object.values(T.equipment).filter(Boolean).length,chest:T.chest,wave:T.wave,room:T.room})),{state:'playing',count:0,chest:null,wave:0,room:0});
 }); await check('conclusão da campanha remove todos os equipamentos',async()=>{
  await bossReward(65);await choose(0);const uid=await page.evaluate(()=>T.equipment.armor.uid);await page.evaluate(()=>T.advance(4));assert.equal(await page.evaluate(()=>T.equipment.armor.uid),uid);await page.evaluate(()=>T.teleport(800,300));await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.state),'result');assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),0);assert.equal(await page.evaluate(()=>T.gearBonus.health||0),0);
 }); await check('cada arena gera só seu guardião antes da segunda fase, sem baú antecipado',async()=>{
  for(let i=0;i<11;i++){
   await start(i*6+5);const r=await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4);T.render();const e=T.enemies.find(e=>!e.dead);return{boss:e.type==='boss',skin:e.skin,expected:T.stages[T.room].boss,count:T.enemies.length,wave:T.wave,chest:T.chest}});
   assert.equal(r.boss,true);assert.equal(r.skin,r.expected);assert.equal(r.count,1);assert.equal(r.wave,1);assert.equal(r.chest,null);
  }
 });
 await check('todos os guardiões atacam e invocam reforços na segunda fase',async()=>{
  for(let i=0;i<11;i++){
   await start(i*6+5);const r=await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4);const b=T.enemies.find(e=>e.type==='boss');b.hp=b.maxHp*.49;b.cooldown=0;T.advance(.03);const phase=b.phase,adds=T.enemies.filter(e=>e!==b).map(e=>e.type);T.advance(4.5);T.render();return{phase,adds,attacked:T.zones.length+T.projectiles.length>0,pool:T.stages[T.room].pool}});
   assert.equal(r.phase,1);assert.equal(r.adds.length,2);assert.ok(r.adds.every(t=>r.pool.includes(t)));assert.equal(r.attacked,true,`Guardião ${i+1}`);
  }
 });
 await check('cada temática desenha seu mapa e gera seus próprios inimigos',async()=>{
  for(let i=0;i<11;i++){
   await start(i*6+2);const r=await page.evaluate(()=>{T.player.invuln=100;T.advance(1.4);T.render();return{valid:T.enemies.every(e=>T.stages[T.room].pool.includes(e.type)),wave:T.wave,count:T.enemies.length,kind:T.encounter.kind}});assert.equal(r.valid,true);assert.equal(r.wave,1);assert.ok(r.count>=4&&r.count<=10);assert.equal(r.kind,'combat');
  }
 });
 await check('Guerreiro mantém combo, especial em área e esquiva invulnerável',async()=>{
  const r=await page.evaluate(()=>{T.startRun(0,'warrior','sword');T.isolate();T.teleport(800,550);const e=T.spawnEnemy('brute',865,550);e.hp=e.maxHp=1000;e.speed=0;e.cooldown=100;T.aim(e.x,e.y);const damage=[];T.player.crit=0;for(let i=0;i<3;i++){T.player.attackCd=0;e.x=T.player.x+60;e.y=T.player.y;const hp=e.hp;T.attack();damage.push(hp-e.hp)}T.special();const area=e.hp<1000-damage.reduce((a,b)=>a+b,0);const hp=T.player.hp;T.player.dash=0;T.dash();T.takeDamage(40);return{damage,area,safe:T.player.hp===hp}});assert.ok(r.damage[0]>0);assert.equal(r.damage[0],r.damage[1]);assert.ok(r.damage[2]>r.damage[1]);assert.equal(r.area,true);assert.equal(r.safe,true);
 });
 await check('as dez armas mantêm seus ataques e especiais',async()=>{
  const ids=await page.evaluate(()=>Object.keys(T.weapons).filter(id=>!T.weapons[id].refuge));assert.equal(ids.length,10);
  for(const id of ids){const info=await page.evaluate(id=>{const w=T.weapons[id];T.startRun(0,w.classId,id);T.isolate();T.teleport(800,550);const e=T.spawnEnemy('brute',855,550);e.hp=e.maxHp=10000;e.cooldown=100;e.speed=0;T.aim(e.x,e.y);T.attack();const attacked=T.player.attackCd>0;T.special();T.render();return{attacked,special:T.player.special>0,id:T.player.weaponId}},id);assert.equal(info.attacked,true,id);assert.equal(info.special,true,id);assert.equal(info.id,id)}
 });
 await check('Arqueiro e Mago mantêm projéteis, magia e recarga das três cargas',async()=>{
  for(const classId of ['archer','mage']){const r=await page.evaluate(classId=>{T.startRun(0,classId);T.isolate();T.teleport(800,550);const e=T.spawnEnemy('brute',1000,550);e.hp=e.maxHp=1000;e.speed=0;e.cooldown=100;T.aim(1000,535);T.attack();const ranged=T.projectiles.some(p=>p.basic);T.cast();T.cast();T.cast();T.cast();const empty=T.player.cast===0;T.advance(4);return{ranged,empty,restored:T.player.cast===3,hit:e.hp<1000}},classId);assert.deepEqual(r,{ranged:true,empty:true,restored:true,hit:true})}
 });
 await check('movimento, limites e pausa continuam funcionando',async()=>{
  const r=await page.evaluate(()=>{T.startRun(0);T.isolate();const x=T.player.x;T.setKeys({d:true});T.advance(.4);const moved=T.player.x>x;T.advance(15);const bounded=T.player.x<1395;T.setKeys({});T.pauseGame();const before=T.player.x;T.setKeys({a:true});T.advance(5);const paused=T.player.x===before;T.pauseGame();T.setKeys({});return{moved,bounded,paused,state:T.state}});assert.deepEqual(r,{moved:true,bounded:true,paused:true,state:'playing'});
 });
 await check('talentos e especializações das três classes permanecem disponíveis',async()=>{
  const r=await page.evaluate(()=>{T.resetMastery();return{paths:Object.keys(T.talentPaths).length,nodes:Object.values(T.talentPaths).reduce((n,p)=>n+p.nodes.length,0),classes:Object.keys(T.save.mastery)}});assert.equal(r.paths,6);assert.equal(r.nodes,18);assert.deepEqual(r.classes.sort(),['archer','mage','warrior']);await page.evaluate(()=>T.openTalents());assert.equal(await page.locator('.talent-path').count(),2);await page.keyboard.press('t');
 });
 await check('trinta escolhas mantêm apenas o último equipamento do mesmo tipo',async()=>{
  const r=await page.evaluate(()=>{T.startRun(0);T.isolate();let last;for(let i=0;i<30;i++){last=T.rollGear('enemy',i%4,'precision');T.addGear(last,false)}return{count:Object.values(T.equipment).filter(Boolean).length,uid:T.equipment.ring.uid,last:last.uid,attack:T.gearBonus.attack,expected:last.stats.attack}});assert.equal(r.count,1);assert.equal(r.uid,r.last);assert.equal(r.attack,r.expected);
 }); await check('bônus equipados e bênçãos atravessam as fases sem duplicação',async()=>{
  const r=await page.evaluate(()=>{T.startRun(6,'warrior');const item=T.rollGear('enemy',3,'obsidian');T.addGear(item,false);const max=T.player.maxHp;T.setupRoom(7);return{max,current:T.player.maxHp,equipped:T.equipment.armor.uid===item.uid}});assert.equal(r.current,r.max);assert.equal(r.equipped,true);
 }); async function eventRoom(room){await start(room);await page.evaluate(()=>T.completeCurrentEncounter());await page.keyboard.press('1');await page.evaluate(()=>T.advance(.05))}
 async function approachEvent(){await page.evaluate(()=>{T.teleport(T.roomEvent.x,T.roomEvent.y);T.advance(.05)});await page.keyboard.press('e')}
 await check('encontros só surgem após as duas ondas e a bênção, sem aparecer nas arenas de chefes',async()=>{
  for(const [room,kind]of [[0,'wanderer'],[2,'altar'],[3,'secret']]){
   await start(room);assert.deepEqual(await page.evaluate(()=>({kind:T.roomEvent.kind,shown:T.roomEvent.shown,open:T.tryRoomEvent()})),{kind,shown:false,open:false});
   await page.evaluate(()=>T.completeCurrentEncounter());assert.equal(await page.evaluate(()=>T.roomEvent.shown),false);await page.keyboard.press('1');assert.equal(await page.evaluate(()=>T.roomEvent.shown),true);assert.equal(await page.evaluate(()=>T.chest),null);
  }
  await start(5);assert.equal(await page.evaluate(()=>T.roomEvent),null);
 });
 await check('Peregrino mostra custos, pausa a partida e permite recusar sem pagar',async()=>{
  await eventRoom(0);await approachEvent();assert.equal(await page.evaluate(()=>T.state),'event');
  assert.match(await page.locator('.event-cost').first().innerText(),/15% de dano recebido/);assert.match(await page.locator('.event-cost').nth(1).innerText(),/15 de vitalidade máxima/);
  const before=await page.evaluate(()=>({hp:T.player.hp,max:T.player.maxHp,gold:T.gold,bonus:{...T.eventBonus},timer:document.getElementById('timer').textContent}));
  await page.keyboard.press('h');await page.keyboard.press('i');await page.keyboard.press('t');await page.evaluate(()=>T.advance(20));assert.equal(await page.evaluate(()=>T.state),'event');
  assert.deepEqual(await page.evaluate(()=>({hp:T.player.hp,max:T.player.maxHp,gold:T.gold,bonus:{...T.eventBonus},timer:document.getElementById('timer').textContent})),before);
  await page.screenshot({path:path.join(__dirname,'previa-pactos.png')});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.state),'playing');assert.equal(await page.evaluate(()=>T.roomEvent.used),true);assert.equal(await page.evaluate(()=>T.eventStats.pacts),0);
 });
 await check('Pacto da fúria amplia acertos e dano recebido, sem duplicar a escolha',async()=>{
  await eventRoom(0);await approachEvent();await page.evaluate(()=>window.stalePact=T.modalHandler);await page.keyboard.press('1');
  const r=await page.evaluate(()=>{window.stalePact(0);T.player.crit=0;const e=T.spawnEnemy('brute',800,500);e.hp=e.maxHp=10000;T.hitEnemy(e,100);const damage=10000-e.hp;T.player.invuln=0;T.player.dash=0;T.player.guard=0;T.player.armor=1;const hp=T.player.hp;T.takeDamage(20);return{damage,taken:hp-T.player.hp,bonus:T.eventBonus.damage,vulnerability:T.eventBonus.vulnerability,pacts:T.eventStats.pacts,reopen:T.openRoomEvent()}});
  assert.deepEqual(r,{damage:120,taken:23,bonus:.2,vulnerability:.15,pacts:1,reopen:false});assert.match(await page.locator('#boons').innerHTML(),/Pacto da fúria/);
 });
 await check('Pacto dos ventos conserva seu custo e velocidade entre fases e reverte ao morrer',async()=>{
  await eventRoom(0);const base=await page.evaluate(()=>T.player.maxHp);await approachEvent();await page.keyboard.press('2');
  assert.deepEqual(await page.evaluate(()=>({max:T.player.maxHp,speed:T.eventBonus.speed,paid:T.eventBonus.healthPaid})),{max:base-15,speed:.12,paid:15});
  await page.evaluate(()=>T.setupRoom(1));assert.equal(await page.evaluate(()=>T.player.maxHp),base-15);assert.equal(await page.evaluate(()=>T.eventBonus.speed),.12);
  await page.evaluate(()=>T.finishRun(false));assert.equal(await page.evaluate(()=>T.player.maxHp),base);assert.deepEqual(await page.evaluate(()=>T.eventBonus),{damage:0,speed:0,vulnerability:0,healthPaid:0});assert.equal(await page.evaluate(()=>T.roomEvent),null);
 });
 await check('pacto que reduziria demais a vitalidade fica bloqueado, inclusive por chamada antiga',async()=>{
  await eventRoom(0);await page.evaluate(()=>{T.player.maxHp=40;T.player.hp=40});await approachEvent();assert.equal(await page.locator('[data-choice="1"]').isDisabled(),true);
  await page.evaluate(()=>T.modalHandler(1));assert.equal(await page.evaluate(()=>T.state),'event');assert.equal(await page.evaluate(()=>T.player.maxHp),40);assert.equal(await page.evaluate(()=>T.eventBonus.speed),0);await page.keyboard.press('Escape');
 });
 await check('altar bloqueia sacrifício fatal e cobra a cura apenas quando há recursos',async()=>{
  await eventRoom(2);await page.evaluate(()=>{T.player.hp=25;T.setGold(39)});await approachEvent();assert.equal(await page.locator('[data-choice="0"]').isDisabled(),true);assert.equal(await page.locator('[data-choice="1"]').isDisabled(),true);
  await page.evaluate(()=>{T.modalHandler(0);T.modalHandler(1)});assert.equal(await page.evaluate(()=>T.player.hp),25);assert.equal(await page.evaluate(()=>T.gold),39);await page.keyboard.press('Escape');
  await eventRoom(2);await page.evaluate(()=>{T.player.hp=25;T.setGold(40)});await approachEvent();await page.keyboard.press('2');assert.equal(await page.evaluate(()=>T.player.hp),65);assert.equal(await page.evaluate(()=>T.gold),0);assert.equal(await page.evaluate(()=>T.eventStats.altars),1);assert.equal(await page.evaluate(()=>T.roomEvent.used),true);
 });
 await check('altar de sangue troca exatamente 25 de vida por poder sem diminuir o máximo',async()=>{
  await eventRoom(2);await page.evaluate(()=>T.player.hp=60);const max=await page.evaluate(()=>T.player.maxHp);await approachEvent();await page.screenshot({path:path.join(__dirname,'previa-altar.png')});await page.keyboard.press('1');
  assert.equal(await page.evaluate(()=>T.player.hp),35);assert.equal(await page.evaluate(()=>T.player.maxHp),max);assert.equal(await page.evaluate(()=>T.eventBonus.damage),.15);assert.equal(await page.evaluate(()=>T.openRoomEvent()),false);
 });
 await check('passagem secreta se revela por proximidade e mantém a contagem e os equipamentos',async()=>{
  await eventRoom(3);assert.equal(await page.evaluate(()=>T.roomEvent.discovered),false);
  const before=await page.evaluate(()=>{const item=T.rollGear('enemy',2,'obsidian');T.addGear(item,false);return{room:T.room,wave:T.wave,uid:item.uid,max:T.player.maxHp,gold:T.gold}});
  await page.evaluate(()=>{T.teleport(1260,540);T.advance(.05);T.render()});assert.equal(await page.evaluate(()=>T.roomEvent.discovered),true);await page.screenshot({path:path.join(__dirname,'previa-passagem-secreta.png')});await page.keyboard.press('e');
  assert.equal(await page.evaluate(()=>T.roomEvent.inside),true);assert.equal(await page.evaluate(()=>T.room),before.room);assert.equal(await page.evaluate(()=>T.wave),before.wave);assert.equal(await page.evaluate(()=>T.equipment.armor.uid),before.uid);assert.equal(await page.evaluate(()=>T.player.maxHp),before.max);assert.equal(await page.evaluate(()=>T.eventStats.secrets),1);assert.match(await page.locator('#roomName').innerText(),/ENTRE OS MUNDOS/);
  await page.evaluate(()=>{T.pickups.push({x:800,y:680,type:'gold',value:100});T.advance(.5);T.nextRoom();T.render()});assert.equal(await page.evaluate(()=>T.gold),before.gold);assert.equal(await page.evaluate(()=>T.room),3);assert.equal(await page.evaluate(()=>T.chest),null);await page.screenshot({path:path.join(__dirname,'previa-sala-secreta.png')});
 });
 await check('sala secreta permite movimento e pausa sem colisões ou combates invisíveis',async()=>{
  const r=await page.evaluate(()=>{T.teleport(340,330);T.setKeys({});T.advance(.1);const noPillarCollision=T.player.x===340&&T.player.y===330;T.setKeys({d:true});T.advance(.4);const moved=T.player.x>340;T.setKeys({});const projectiles=T.projectiles.length,zones=T.zones.length;T.attack();T.special();T.cast();const noAttack=T.projectiles.length===projectiles&&T.zones.length===zones;T.pauseGame();const x=T.player.x;T.setKeys({d:true});T.advance(5);const paused=T.player.x===x;T.pauseGame();T.setKeys({});return{noPillarCollision,moved,noAttack,paused,inside:T.roomEvent.inside}});assert.deepEqual(r,{noPillarCollision:true,moved:true,noAttack:true,paused:true,inside:true});
 });
 await check('oferenda secreta é única e o retorno fecha a passagem sem perder itens ou níveis',async()=>{
  const uid=await page.evaluate(()=>T.equipment.armor.uid);await page.evaluate(()=>T.teleport(800,455));await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.state),'event');await page.keyboard.press('1');
  assert.equal(await page.evaluate(()=>T.roomEvent.rewardUsed),true);assert.equal(await page.evaluate(()=>T.eventBonus.damage),.12);assert.equal(await page.evaluate(()=>T.openRoomEvent()),false);
  await page.evaluate(()=>{T.teleport(800,740);T.render()});await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.roomEvent.inside),false);assert.equal(await page.evaluate(()=>T.roomEvent.used),true);assert.equal(await page.evaluate(()=>T.room),3);assert.equal(await page.evaluate(()=>T.wave),2);assert.equal(await page.evaluate(()=>T.equipment.armor.uid),uid);assert.equal(await page.evaluate(()=>T.enterSecretRoom()),false);assert.equal(await page.evaluate(()=>T.portal),true);
 });
 await check('encontros acumulam benefícios entre temáticas e somem ao terminar a tentativa',async()=>{
  await eventRoom(0);await approachEvent();await page.keyboard.press('1');
  await page.evaluate(()=>{T.setupRoom(6);T.completeCurrentEncounter()});await page.keyboard.press('1');await approachEvent();await page.keyboard.press('1');
  assert.equal(await page.evaluate(()=>T.eventBonus.damage),.4);assert.equal(await page.evaluate(()=>T.eventBonus.vulnerability),.3);assert.equal(await page.evaluate(()=>T.eventStats.pacts),2);
  await page.evaluate(()=>T.finishRun(true));assert.equal(await page.evaluate(()=>T.eventBonus.damage),0);assert.equal(await page.evaluate(()=>T.roomEvent),null);assert.doesNotMatch(await page.locator('#boons').innerHTML(),/Pacto da fúria/);
 });
 await check('eventos e salas secretas são utilizáveis no celular',async()=>{
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await mobile.newPage();p.on('pageerror',e=>errors.push(e.message));await mobile.route('https://cinzas.test/**',route=>route.fulfill({contentType:'text/html',body:testHtml}));await p.goto('https://cinzas.test');
  await p.evaluate(()=>{T.startRun(0);T.completeCurrentEncounter()});await p.locator('[data-choice="0"]').tap();await p.evaluate(()=>{T.teleport(1110,600);T.advance(.05)});await p.locator('[data-action="cast"]').tap();assert.equal(await p.evaluate(()=>T.state),'event');assert.equal(await p.evaluate(()=>T.eventStats.pacts),0);assert.ok((await p.locator('#modalTitle').boundingBox()).y>=0);assert.equal(await p.locator('.event-choices .choice').count(),3);await p.screenshot({path:path.join(__dirname,'previa-pactos-celular.png')});await p.locator('[data-choice="2"]').tap();
  await p.evaluate(()=>{T.setupRoom(3);T.completeCurrentEncounter()});await p.locator('[data-choice="0"]').tap();await p.evaluate(()=>{T.teleport(1260,540);T.advance(.05)});await p.locator('[data-action="cast"]').tap();assert.equal(await p.evaluate(()=>T.roomEvent.inside),true);await p.evaluate(()=>T.render());await p.screenshot({path:path.join(__dirname,'previa-sala-secreta-celular.png')});
  await p.evaluate(()=>T.teleport(800,455));await p.locator('[data-action="cast"]').tap();assert.equal(await p.evaluate(()=>T.state),'event');await p.locator('[data-choice="0"]').tap();assert.equal(await p.evaluate(()=>T.eventBonus.damage),.12);await p.evaluate(()=>T.teleport(800,740));await p.locator('[data-action="cast"]').tap();assert.equal(await p.evaluate(()=>T.roomEvent.inside),false);assert.equal(await p.evaluate(()=>T.room),3);assert.equal(await p.evaluate(()=>T.chest),null);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.close();
 });
 await check('itens no chão exigem escolha e não substituem nada por aproximação',async()=>{
  const before=await page.evaluate(()=>{T.startRun(0);T.isolate();T.addGear(T.rollGear('enemy',0,'hunter'),false);const old=T.equipment.ring.uid,item=T.rollGear('enemy',2,'precision');T.pickups.push({x:T.player.x,y:T.player.y,type:'gear',item});T.advance(.2);return{old,uid:item.uid,count:T.pickups.length}});assert.equal(await page.evaluate(()=>T.equipment.ring.uid),before.old);await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.state),'gearChoice');await page.keyboard.press('1');assert.equal(await page.evaluate(()=>T.equipment.ring.uid),before.uid);assert.equal(await page.evaluate(()=>T.pickups.length),0);
 });
 await check('dispensar item no chão não modifica o equipamento atual',async()=>{
  const uid=await page.evaluate(()=>{T.startRun(0);T.isolate();T.addGear(T.rollGear('enemy',1,'hunter'),false);T.pickups.push({x:T.player.x,y:T.player.y,type:'gear',item:T.rollGear('enemy',0,'precision')});return T.equipment.ring.uid});await page.keyboard.press('e');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.equipment.ring.uid),uid);assert.equal(await page.evaluate(()=>T.pickups.length),0);
 });
 await check('limpar níveis sem matar chefe não grava avanço da campanha',async()=>{
  await page.evaluate(()=>T.resetCampaigns());await start(4);await page.evaluate(()=>T.completeCurrentEncounter());assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),0);await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),0);assert.match(await page.locator('#campaignProgress').innerText(),/0 \/ 55/);
 });
 await check('chefe grava cinco níveis imediatamente e não duplica a contagem',async()=>{
  const r=await page.evaluate(()=>{T.resetCampaigns();T.startRun(5);T.player.invuln=100;T.advance(1.4);const boss=T.enemies.find(e=>e.type==='boss');T.killEnemy(boss);const first=T.completedLevels('warrior');T.killEnemy(boss);T.commitBossCheckpoint();return{first,after:T.completedLevels('warrior'),other:T.completedLevels('archer'),stored:JSON.parse(localStorage.getItem('cinzas-save-v1')).campaigns.warrior.clearedRealms}});assert.deepEqual(r,{first:5,after:5,other:0,stored:1});
  await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),6);
 });
 await check('equipamento do chefe é salvo no checkpoint e volta equipado ao recarregar',async()=>{
  await page.evaluate(()=>T.resetCampaigns());await bossReward(5);await choose(0);const before=await page.evaluate(()=>({template:T.equipment.armor.templateId,max:T.player.maxHp,bonus:T.gearBonus.health,boons:T.boons.map(b=>b.id)}));await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),6);assert.deepEqual(await page.evaluate(()=>({template:T.equipment.armor.templateId,max:T.player.maxHp,bonus:T.gearBonus.health,boons:T.boons.map(b=>b.id)})),before);
 });
 await check('avanço entre chefes não altera checkpoint e morte mantém os níveis sem itens',async()=>{
  await page.evaluate(()=>{T.setupRoom(9);T.completeCurrentEncounter()});await page.keyboard.press('1');assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),5);await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),6);
  await page.evaluate(()=>{T.player.invuln=0;T.player.dash=0;T.player.revive=false;T.takeDamage(99999)});assert.equal(await page.evaluate(()=>T.state),'result');assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),5);assert.equal(await page.evaluate(()=>T.campaignFor('warrior').checkpoint),null);await page.locator('[data-choice="1"]').click();assert.equal(await page.evaluate(()=>T.room),6);assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),0);
 });
 await check('Guerreiro, Arqueiro e Mago retomam seus próprios checkpoints',async()=>{
  await page.evaluate(()=>T.resetCampaigns());
  for(const [id,bosses]of [['warrior',2],['archer',1],['mage',0]]){
   for(let i=0;i<bosses;i++)await page.evaluate(({id,i})=>{T.startRun(i*6+5,id);T.player.invuln=100;T.advance(1.4);T.killEnemy(T.enemies.find(e=>e.type==='boss'))},{id,i});
  }
  await page.reload();for(const [id,room,levels]of [['warrior',12,10],['archer',6,5],['mage',0,0]]){
   await page.evaluate(()=>T.backToMenu());await page.locator(`[data-class="${id}"]`).click();assert.match(await page.locator('#campaignProgress').innerText(),new RegExp(levels+' / 55'));await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),room);assert.equal(await page.evaluate(()=>T.player.classId),id);
  }
 });
 await check('salvamentos antigos não convertem salas visitadas em níveis concluídos',async()=>{
  await page.evaluate(()=>localStorage.setItem('cinzas-save-v1',JSON.stringify({ash:50,level:2,best:66,selectedClass:'warrior'})));await page.reload();assert.deepEqual(await page.evaluate(()=>Object.keys(T.classes).map(id=>T.completedLevels(id))),[0,0,0]);assert.equal(await page.evaluate(()=>T.save.ash),50);assert.equal(await page.evaluate(()=>T.save.level),2);
 });
 await check('recomeçar uma classe exige escolha e não apaga as demais',async()=>{
  await page.evaluate(()=>{T.resetCampaigns();for(const id of ['warrior','archer']){T.startRun(5,id);T.player.invuln=100;T.advance(1.4);T.killEnemy(T.enemies.find(e=>e.type==='boss'))}T.backToMenu();T.selectClass('warrior')});await page.locator('#startRealms').click();assert.equal(await page.evaluate(()=>T.state),'campaignReset');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),5);await page.locator('#startRealms').click();await page.locator('[data-choice="0"]').click();assert.equal(await page.evaluate(()=>T.room),0);assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),0);assert.equal(await page.evaluate(()=>T.completedLevels('archer')),5);
 });

 await check('portal tem prioridade sobre equipamentos caídos ao lado da saída',async()=>{
  await eventRoom(1);await page.evaluate(()=>{T.teleport(800,300);T.pickups.push({x:800,y:300,type:'gear',item:T.rollGear('enemy',0,'hunter')});T.advance(.01)});await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.state),'route');await page.keyboard.press('2');assert.equal(await page.evaluate(()=>T.room),2);
 });
 await check('equipamento de fase não confirmada não altera o snapshot do último chefe',async()=>{
  await page.evaluate(()=>T.resetCampaigns());await bossReward(5);await choose(0);const before=await page.evaluate(()=>JSON.stringify(T.campaignFor('warrior').checkpoint));await page.evaluate(()=>{T.setupRoom(7);T.addGear(T.rollGear('enemy',3,'hunter'),false)});assert.equal(await page.evaluate(()=>JSON.stringify(T.campaignFor('warrior').checkpoint)),before);await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),6);assert.equal(await page.evaluate(()=>T.equipment.ring),null);
 });
 await check('checkpoint danificado mantém a posição confirmada sem produzir atributos inválidos',async()=>{
  await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('cinzas-save-v1'));data.campaigns.warrior.checkpoint.player.maxHp='inválido';localStorage.setItem('cinzas-save-v1',JSON.stringify(data))});await page.reload();await page.locator('#start').click();assert.equal(await page.evaluate(()=>T.room),6);assert.equal(await page.evaluate(()=>Number.isFinite(T.player.maxHp)&&T.player.maxHp>0),true);assert.ok(await page.evaluate(()=>T.boons.length>=4));assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),0);
 });
 await check('campanha concluída oferece recomeço explícito em vez de travar o botão de repetir',async()=>{
  await page.evaluate(()=>{T.campaignFor('warrior').clearedRealms=11;T.finishRun(true)});await page.locator('[data-choice="1"]').click();assert.equal(await page.evaluate(()=>T.state),'campaignReset');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.state),'menu');assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),55);await page.screenshot({path:path.join(__dirname,'previa-progresso-classe.png')});
 });
 await check('campanha confirma somente cinco níveis por chefe e conclui os 55 níveis',async()=>{
  await page.evaluate(()=>T.resetCampaigns());await start(0,'archer','longbow');
  for(let room=0;room<66;room++){
   assert.equal(await page.evaluate(()=>T.room),room);await page.evaluate(()=>T.completeCurrentEncounter());const boss=room%6===5;
   assert.equal(await page.evaluate(()=>T.completedLevels('archer')),Math.floor((room+1)/6)*5,`Contagem da sala ${room}`);
   if(room!==65){assert.equal(await page.evaluate(()=>T.state),'blessing');await page.keyboard.press('1')}
   if(boss){await choose(room%3);assert.equal(await page.evaluate(()=>T.chest),null)}else assert.equal(await page.evaluate(()=>T.wave),2);
   await page.evaluate(()=>T.teleport(800,300));await page.keyboard.press('e');if(room===65){assert.equal(await page.evaluate(()=>T.state),'result');break}await page.keyboard.press('2');
  }
  assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),0);assert.equal(await page.evaluate(()=>T.completedLevels('archer')),55);assert.equal(await page.evaluate(()=>T.completedLevels('warrior')),0);assert.equal(await page.evaluate(()=>T.completedLevels('mage')),0);
 }); await check('salvamento mantém níveis confirmados, cinzas e maestria após recarregar',async()=>{
  const before=await page.evaluate(()=>({ash:T.save.ash,campaigns:T.save.campaigns,mastery:T.save.mastery}));await page.reload();assert.deepEqual(await page.evaluate(()=>({ash:T.save.ash,campaigns:T.save.campaigns,mastery:T.save.mastery})),before);await start(0);assert.equal(await page.evaluate(()=>Object.values(T.equipment).filter(Boolean).length),0);
 }); await check('gera prévias da floresta, do chefe e do baú após sua derrota',async()=>{
  await start(10,'mage','icestaff');await page.evaluate(()=>{T.player.invuln=100;T.advance(1.5)});await page.screenshot({path:path.join(__dirname,'previa-floresta.png')});
  await start(11,'warrior','spear');await page.evaluate(()=>{T.player.invuln=100;T.advance(1.5)});await page.screenshot({path:path.join(__dirname,'previa-chefe-floresta.png')});
  await page.evaluate(()=>T.completeCurrentEncounter());await page.keyboard.press('1');await page.screenshot({path:path.join(__dirname,'previa-bau-chefe.png')});
 });
 await check('baú equipa diretamente e painel sem mochila é utilizável no celular',async()=>{
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await mobile.newPage();p.on('pageerror',e=>errors.push(e.message));await mobile.route('https://cinzas.test/**',route=>route.fulfill({contentType:'text/html',body:testHtml}));await p.goto('https://cinzas.test');await p.locator('#start').tap();await p.evaluate(()=>{T.startRun(5);T.completeCurrentEncounter()});await p.locator('[data-choice="0"]').tap();await p.evaluate(()=>T.teleport(800,520));await p.locator('[data-action="cast"]').tap();assert.equal(await p.evaluate(()=>T.state),'chestChoice');await p.locator('[data-choice="2"]').tap();assert.equal(await p.evaluate(()=>T.state),'playing');assert.equal(await p.evaluate(()=>!!T.equipment.amulet),true);assert.equal(await p.evaluate(()=>T.chest),null);
  await p.locator('#inventoryButton').tap();assert.equal(await p.locator('.equipped-list .gear-detail-card').count(),3);assert.equal(await p.locator('.bag-item,[data-gear-unequip],[data-gear-equip]').count(),0);await p.screenshot({path:path.join(__dirname,'previa-equipamentos-celular.png')});await p.locator('[data-inventory-close]').tap();await p.evaluate(()=>T.teleport(800,300));await p.locator('[data-action="cast"]').tap();await p.locator('[data-choice="1"]').tap();assert.equal(await p.evaluate(()=>T.room),6);assert.equal(await p.evaluate(()=>!!T.equipment.amulet),true);assert.equal(await p.evaluate(()=>T.completedLevels('warrior')),5);await mobile.close();
 }); async function freshRefuge(){await page.evaluate(()=>{T.backToMenu();T.resetCampaigns();T.resetRefuge();T.resetMastery();T.selectClass('warrior');T.openRefuge();T.render()})}
 await check('refúgio: entrada pelo menu, estações e retorno sem alterar o progresso',async()=>{
  await page.evaluate(()=>{T.backToMenu();T.resetCampaigns();T.resetRefuge()});const before=await page.evaluate(()=>JSON.stringify(T.save.campaigns));await page.locator('#refugeMenuButton').click();assert.equal(await page.evaluate(()=>T.state),'refuge');assert.equal(await page.locator('#refugeUi').isVisible(),true);assert.equal(await page.locator('[data-refuge-station]').count(),5);await page.evaluate(()=>T.render());await page.screenshot({path:path.join(__dirname,'previa-refugio.png')});await page.locator('#refugeExitButton').click();assert.equal(await page.evaluate(()=>T.state),'menu');assert.equal(await page.evaluate(()=>JSON.stringify(T.save.campaigns)),before);
 });
 await check('refúgio: movimento, interação com personagens e classes independentes',async()=>{
  await freshRefuge();const x=await page.evaluate(()=>T.refugeAvatar.x);await page.evaluate(()=>{T.setKeys({d:true});T.advance(.4);T.setKeys({})});assert.ok(await page.evaluate(x=>T.refugeAvatar.x>x,x));await page.locator('[data-refuge-class="archer"]').click();assert.equal(await page.evaluate(()=>T.refugeAvatar.classId),'archer');await page.evaluate(()=>{T.refugeAvatar.x=430;T.refugeAvatar.y=455});await page.keyboard.press('e');assert.equal(await page.evaluate(()=>T.state),'refugePanel');assert.match(await page.locator('#modalContent .eyebrow').innerText(),/Ícaro/i);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.state),'refuge');
 });
 await check('refúgio: abertura durante campanha ativa é recusada',async()=>{
  await page.evaluate(()=>T.startRun(0));const before=await page.evaluate(()=>({room:T.room,hp:T.player.hp,save:JSON.stringify(T.save.campaigns)}));assert.equal(await page.evaluate(()=>T.openRefuge()),false);assert.equal(await page.evaluate(()=>T.state),'playing');assert.deepEqual(await page.evaluate(()=>({room:T.room,hp:T.player.hp,save:JSON.stringify(T.save.campaigns)})),before);
 });
 await check('refúgio: treino real causa dano nos alvos sem ganhar XP, cinzas, itens ou níveis',async()=>{
  await freshRefuge();const before=await page.evaluate(()=>({campaigns:JSON.stringify(T.save.campaigns),mastery:JSON.stringify(T.save.mastery),ash:T.save.ash}));
  await page.locator('[data-refuge-station="training"]').click();await page.locator('[data-choice="0"]').click();assert.equal(await page.evaluate(()=>T.trainingMode),true);
  const r=await page.evaluate(()=>{T.teleport(800,520);T.aim(800,414);T.attack();T.special();T.cast();T.dash();T.advance(2);return{damage:T.trainingSession.damage,hits:T.trainingSession.hits,dummies:T.enemies.filter(e=>e.dummy&&!e.dead).length,kills:T.kills,ash:T.runAsh,gold:T.gold,equipment:Object.values(T.equipment).filter(Boolean).length,chest:T.chest,actions:T.refugeClass('warrior').actions}});
  assert.ok(r.damage>0);assert.ok(r.hits>0);assert.equal(r.dummies,3);assert.equal(r.kills,0);assert.equal(r.ash,0);assert.equal(r.gold,0);assert.equal(r.equipment,0);assert.equal(r.chest,null);assert.deepEqual(r.actions,{special:true,cast:true,dash:true});assert.deepEqual(await page.evaluate(()=>({campaigns:JSON.stringify(T.save.campaigns),mastery:JSON.stringify(T.save.mastery),ash:T.save.ash})),before);await page.evaluate(()=>T.render());await page.screenshot({path:path.join(__dirname,'previa-treinamento.png')});
 });
 await check('refúgio: alvos não morrem nem concedem recompensas e treino não confirma chefes',async()=>{
  const before=await page.evaluate(()=>({ash:T.save.ash,mastery:JSON.stringify(T.save.mastery),campaigns:JSON.stringify(T.save.campaigns)}));const r=await page.evaluate(()=>{const target=T.enemies[0];T.hitEnemy(target,100000);T.killEnemy(target);const hp=T.player.hp;T.player.invuln=0;T.takeDamage(9999);T.awardClassXp(500);T.commitBossCheckpoint();T.ensureChest();return{alive:!target.dead&&target.hp>0,hp:T.player.hp===hp,ash:T.runAsh,kills:T.kills,chest:T.chest}});assert.deepEqual(r,{alive:true,hp:true,ash:0,kills:0,chest:null});assert.deepEqual(await page.evaluate(()=>({ash:T.save.ash,mastery:JSON.stringify(T.save.mastery),campaigns:JSON.stringify(T.save.campaigns)})),before);
 });
 await check('refúgio: zerar a medição conserva a missão e pausar congela o treino',async()=>{
  const damage=await page.evaluate(()=>T.refugeClass('warrior').trainingDamage);await page.locator('#trainingReset').click();assert.equal(await page.evaluate(()=>T.trainingSession.damage),0);assert.equal(await page.evaluate(()=>T.refugeClass('warrior').trainingDamage),damage);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>T.state),'paused');await page.evaluate(()=>T.advance(5));assert.equal(await page.evaluate(()=>T.trainingSession.damage),0);await page.locator('[data-choice="0"]').click();assert.equal(await page.evaluate(()=>T.state),'playing');await page.locator('#trainingReturn').click();assert.equal(await page.evaluate(()=>T.state),'refuge');assert.equal(await page.evaluate(()=>T.trainingMode),false);
 });
 await check('refúgio: tempo pausado não diminui artificialmente a medição de DPS',async()=>{
  await freshRefuge();await page.evaluate(()=>{T.startTraining('warrior','sword');T.hitEnemy(T.enemies[0],100);T.advance(1);T.pauseGame();T.advance(20);T.pauseGame();T.advance(.1)});const dps=Number((await page.locator('#trainingNumbers').innerText()).match(/([\d.]+) DPS/)[1]);assert.ok(dps>85,dps);await page.evaluate(()=>T.leaveTraining());
 });
 await check('refúgio: encerrar treino conserva o checkpoint e seus equipamentos salvos',async()=>{
  await page.evaluate(()=>{T.resetCampaigns();T.startRun(5);T.completeCurrentEncounter()});await page.keyboard.press('1');await page.evaluate(()=>{T.addGear(T.rollGear('boss',2,'obsidian'),false);T.backToMenu();T.openRefuge()});const before=await page.evaluate(()=>JSON.stringify(T.campaignFor('warrior')));await page.evaluate(()=>T.startTraining('warrior','sword'));await page.evaluate(()=>{T.hitEnemy(T.enemies[0],300);T.finishRun(false)});assert.equal(await page.evaluate(()=>T.state),'refuge');assert.equal(await page.evaluate(()=>JSON.stringify(T.campaignFor('warrior'))),before);await page.evaluate(()=>T.departRefuge());assert.equal(await page.evaluate(()=>T.room),6);assert.equal(await page.evaluate(()=>!!T.equipment.armor),true);
 });
 await check('refúgio: três armas ancestrais começam bloqueadas e as dez originais estão liberadas',async()=>{
  await freshRefuge();const r=await page.evaluate(()=>Object.entries(T.weapons).map(([id,w])=>({id,relic:!!w.refuge,owned:T.isWeaponUnlocked(id)})));assert.equal(r.length,13);assert.equal(r.filter(w=>!w.relic&&w.owned).length,10);assert.equal(r.filter(w=>w.relic&&!w.owned).length,3);assert.equal(await page.evaluate(()=>T.selectWeapon('dawnblade')),false);await page.locator('[data-refuge-station="forge"]').click();assert.equal(await page.evaluate(()=>T.forgeRefugeWeapon()),false);
 });
 await check('refúgio: forja exige chefe e cinzas, cobra uma vez e libera a arma da classe',async()=>{
  await freshRefuge();await page.evaluate(()=>T.save.ash=100);await page.locator('[data-refuge-station="forge"]').click();assert.equal(await page.evaluate(()=>T.forgeRefugeWeapon()),false);await page.keyboard.press('Escape');await page.evaluate(()=>{T.seedRefuge('warrior',1);T.save.ash=39});await page.locator('[data-refuge-station="forge"]').click();assert.equal(await page.evaluate(()=>T.forgeRefugeWeapon()),false);await page.evaluate(()=>T.save.ash=40);assert.equal(await page.evaluate(()=>T.forgeRefugeWeapon()),true);assert.equal(await page.evaluate(()=>T.save.ash),0);assert.equal(await page.evaluate(()=>T.isWeaponUnlocked('dawnblade')),true);assert.equal(await page.evaluate(()=>T.selectedWeapons.warrior),'dawnblade');assert.equal(await page.evaluate(()=>T.forgeRefugeWeapon()),false);assert.equal(await page.evaluate(()=>T.save.ash),0);assert.equal(await page.evaluate(()=>T.isWeaponUnlocked('eclipsebow')),false);await page.screenshot({path:path.join(__dirname,'previa-forja.png')});
 });
 await check('refúgio: novas armas funcionam nas três classes e seus desbloqueios persistem',async()=>{
  for(const [classId,id]of [['warrior','dawnblade'],['archer','eclipsebow'],['mage','aetherstaff']]){
   await page.evaluate(()=>{if(T.state==='refugePanel')T.closeRefugePanel();else if(T.state==='playing')T.leaveTraining()});await page.evaluate(classId=>{T.setRefugeClass(classId);T.seedRefuge(classId,1);T.save.ash=80;T.openRefugeStation('forge');T.forgeRefugeWeapon()},classId);await page.keyboard.press('Escape');
   const r=await page.evaluate(({classId,id})=>{T.startTraining(classId,id);T.teleport(800,520);T.aim(800,414);T.attack();const attack=T.player.attackCd>0;T.special();T.advance(1.8);T.render();return{id:T.player.weaponId,attack,damage:T.trainingSession.damage,special:T.player.special>0}}, {classId,id});assert.equal(r.id,id);assert.equal(r.attack,true);assert.ok(r.damage>0,id);assert.equal(r.special,true);
  }
  await page.evaluate(()=>T.leaveTraining());await page.reload();assert.deepEqual(await page.evaluate(()=>Object.values(T.refugeRelics).map(id=>T.isWeaponUnlocked(id))),[true,true,true]);
 });
 await check('refúgio: missões bloqueiam resgate antecipado e concedem apenas uma aparência por feito',async()=>{
  await freshRefuge();await page.locator('[data-refuge-station="guide"]').click();assert.equal(await page.evaluate(()=>T.claimRefugeMission('guardian')),false);assert.equal(await page.evaluate(()=>T.claimRefugeMission('dawn')),false);await page.evaluate(()=>T.seedRefuge('warrior',1));assert.equal(await page.evaluate(()=>T.claimRefugeMission('guardian')),true);assert.equal(await page.evaluate(()=>T.claimRefugeMission('guardian')),false);assert.equal(await page.evaluate(()=>T.refugeClass('archer').claimed.length),0);await page.evaluate(()=>T.seedRefuge('warrior',3));assert.equal(await page.evaluate(()=>T.claimRefugeMission('dawn')),true);await page.screenshot({path:path.join(__dirname,'previa-missoes.png')});
 });
 await check('refúgio: missão de treino exige dano e todos os movimentos, com progresso individual',async()=>{
  await freshRefuge();await page.evaluate(()=>{T.startTraining('archer','longbow');T.hitEnemy(T.enemies[0],600);T.leaveTraining();T.openRefugeStation('guide')});assert.equal(await page.evaluate(()=>T.claimRefugeMission('training')),false);await page.keyboard.press('Escape');await page.evaluate(()=>{T.startTraining('archer','longbow');T.special();T.cast();T.dash();T.leaveTraining();T.openRefugeStation('guide')});assert.equal(await page.evaluate(()=>T.claimRefugeMission('training')),true);assert.deepEqual(await page.evaluate(()=>T.refugeClass('archer').claimed),['training']);assert.equal(await page.evaluate(()=>T.refugeClass('warrior').trainingDamage),0);assert.equal(await page.evaluate(()=>T.claimRefugeMission('training')),false);
 });
 await check('refúgio: aparência é individual, persiste e não altera os atributos de combate',async()=>{
  await freshRefuge();await page.locator('[data-refuge-station="wardrobe"]').click();assert.equal(await page.evaluate(()=>T.selectRefugeSkin('moon')),false);await page.keyboard.press('Escape');await page.evaluate(()=>{T.seedRefuge('warrior',1);T.openRefugeStation('guide');T.claimRefugeMission('guardian');T.closeRefugePanel();T.openRefugeStation('wardrobe')});assert.equal(await page.evaluate(()=>T.selectRefugeSkin('ember')),true);assert.equal(await page.evaluate(()=>T.refugeClass('archer').skin),'classic');await page.screenshot({path:path.join(__dirname,'previa-aparencias.png')});await page.reload();assert.equal(await page.evaluate(()=>T.refugeClass('warrior').skin),'ember');
  const r=await page.evaluate(()=>{T.startRun(0,'warrior','sword');const before={hp:T.player.maxHp,damage:T.player.damage,speed:T.player.speed,crit:T.player.crit};T.refugeClass('warrior').skin='classic';T.render();const after={hp:T.player.maxHp,damage:T.player.damage,speed:T.player.speed,crit:T.player.crit};return{before,after}});assert.deepEqual(r.before,r.after);
 });
 await check('refúgio: derrota oferece acesso ao refúgio e partida respeita a classe selecionada',async()=>{
  await page.evaluate(()=>T.finishRun(false));await page.locator('[data-choice="5"]').click();assert.equal(await page.evaluate(()=>T.state),'refuge');await page.locator('[data-refuge-class="mage"]').click();await page.locator('[data-refuge-station="depart"]').click();assert.equal(await page.evaluate(()=>T.state),'playing');assert.equal(await page.evaluate(()=>T.player.classId),'mage');
 });
 await check('refúgio: estações e treinamento são utilizáveis no celular',async()=>{
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await mobile.newPage();p.on('pageerror',e=>errors.push(e.message));await mobile.route('https://cinzas.test/**',route=>route.fulfill({contentType:'text/html',body:testHtml}));await p.goto('https://cinzas.test');await p.locator('#refugeMenuButton').tap();assert.equal(await p.evaluate(()=>T.state),'refuge');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.evaluate(()=>T.render());await p.screenshot({path:path.join(__dirname,'previa-refugio-celular.png')});await p.locator('[data-refuge-station="guide"]').tap();assert.equal(await p.evaluate(()=>T.state),'refugePanel');assert.ok((await p.locator('#modalTitle').boundingBox()).y>=0);await p.locator('[data-choice="2"]').tap();await p.locator('[data-refuge-station="training"]').tap();await p.locator('[data-choice="0"]').tap();assert.equal(await p.evaluate(()=>T.trainingMode),true);
  await p.evaluate(()=>{T.teleport(800,520);T.aim(800,414)});await p.locator('[data-action="attack"]').tap();await p.locator('[data-action="special"]').tap();await p.locator('[data-action="cast"]').tap();await p.evaluate(()=>{T.advance(1.5);T.render()});assert.ok(await p.evaluate(()=>T.trainingSession.damage>0));const stats=await p.locator('#trainingUi').boundingBox();assert.ok(stats.y>=180&&stats.y+stats.height<345);await p.screenshot({path:path.join(__dirname,'previa-treinamento-celular.png')});await p.locator('#trainingReturn').tap();assert.equal(await p.evaluate(()=>T.state),'refuge');await p.locator('#refugeExitButton').tap();assert.equal(await p.evaluate(()=>T.state),'menu');await mobile.close();
 });

 assert.deepEqual(errors,[]);console.log(`\n${passed} verificações passaram. Nenhum erro de JavaScript.`);await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
