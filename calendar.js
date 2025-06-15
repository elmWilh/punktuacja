// Calendar — original structure + targeted fix so status selection persists
// -----------------------------------------------------------
// Key change: we *stop* full re-renders after each status change.
// Instead, we update only the affected day card and summary.
// -----------------------------------------------------------

/* ==== DOM refs ==== */
const calendarGrid       = document.getElementById('calendar-grid');
const currentMonthYear   = document.getElementById('current-month-year');
const prevMonthBtn       = document.getElementById('prev-month-btn');
const nextMonthBtn       = document.getElementById('next-month-btn');
const targetPeriod       = document.getElementById('target-period');
const workingDaysSpan    = document.getElementById('working-days');
const totalPointsSpan    = document.getElementById('total-points');
const calendarYieldSpan  = document.getElementById('calendar-yield');
const progressPointsEl   = document.getElementById('progress-points');
const monthlyNormEl      = document.getElementById('monthly-norm');
const progressBarEl      = document.getElementById('progress-bar');
const monthlyOkEl        = document.getElementById('monthly-ok');
const monthlyBerEl       = document.getElementById('monthly-ber');
const monthlyYieldEl     = document.getElementById('monthly-yield');
const estimatedSalaryEl  = document.getElementById('estimated-salary');
const container          = document.querySelector('.container');

/* ==== State ==== */
let currentDate  = new Date();
let calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
let workingDaysList = JSON.parse(localStorage.getItem('workingDaysList')) || [];
let isRendering = false;
const dailyNorm = 17;

// Map для быстрого доступа к уже созданным карточкам — не пересоздаём их при каждом клике
const dayCardMap = new Map();

/* ==== Utils ==== */
const debounce = (fn, wait=300) => { let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait); }; };
const formatDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const getShift   = d => {
  const start = new Date(2025,4,26);
  const weeks = Math.floor((d-start)/(1000*60*60*24*7));
  return weeks%2===0 ? '1st Shift':'2nd Shift';
};
const isWeekend  = d => [0,6].includes(d.getDay());

/* ==== Period helpers ==== */
function getTargetPeriod(date){
  const now = new Date(date);
  const day = now.getDate();
  return day<29
    ? {start:new Date(now.getFullYear(), now.getMonth()-1,29), end:new Date(now.getFullYear(), now.getMonth(),28)}
    : {start:new Date(now.getFullYear(), now.getMonth(),29),   end:new Date(now.getFullYear(), now.getMonth()+1,28)};
}

/* ==== Salary calc (unchanged) ==== */
function calculateSalary(points, days, yieldPercent){
  const base=3705.1, bonusPerDay=800; let bonus=0;
  if(days && points/days>=dailyNorm){
    bonus+=bonusPerDay;
    const extra=points-dailyNorm*days;
    if(extra>0){
      let r; if(yieldPercent<60)r=3; else if(yieldPercent<65)r=4.5; else if(yieldPercent<70)r=6.5; else if(yieldPercent<72.5)r=8; else if(yieldPercent<75)r=9.5; else if(yieldPercent<77.5)r=11; else if(yieldPercent<80)r=12.5; else if(yieldPercent>=82.5)r=15.5; else r=14; bonus+=extra*r; }
  }
  return (base+bonus).toFixed(2);
}

/* ==== Monthly stats (unchanged) ==== */
function calculateMonthlyStats(year, month){
  let pts=0, ok=0, ber=0;
  const days=workingDaysList.length;
  workingDaysList.forEach(({dateKey})=>{
    const d=calendarData[dateKey]||{points:0,ok:0,ber:0};
    pts+=+d.points||0; ok+=+d.ok||0; ber+=+d.ber||0;
  });
  const norm=days*dailyNorm;
  const prog=norm?(pts/norm)*100:0;
  const yld=ok+ber?(ok/(ok+ber))*100:0;
  return {totalPoints:pts.toFixed(2),totalOK:ok.toFixed(2),totalBER:ber.toFixed(2),workingDaysCount:days,monthlyNorm:norm.toFixed(2),progressPercentage:Math.min(prog,100).toFixed(2),yieldPercentage:yld.toFixed(2),estimatedSalary:calculateSalary(pts,days,yld)};
}

function updateSummary(year,month){
  const {start,end}=getTargetPeriod(new Date(year,month,1));
  const mn=['January','February','March','April','May','June','July','August','September','October','November','December'];
  targetPeriod.textContent=`${start.getDate()} ${mn[start.getMonth()]} ${start.getFullYear()} - ${end.getDate()} ${mn[end.getMonth()]} ${end.getFullYear()}`;
  const s=calculateMonthlyStats(year,month);
  workingDaysSpan.textContent=s.workingDaysCount;
  totalPointsSpan.textContent=s.totalPoints;
  calendarYieldSpan.textContent=s.yieldPercentage;
  progressPointsEl.textContent=s.totalPoints;
  monthlyNormEl.textContent=s.monthlyNorm;
  progressBarEl.style.width=`${s.progressPercentage}%`;
  monthlyOkEl.textContent=s.totalOK;
  monthlyBerEl.textContent=s.totalBER;
  monthlyYieldEl.textContent=s.yieldPercentage;
  estimatedSalaryEl.textContent=`${s.estimatedSalary} PLN`;
}

/* ==== Calendar render (original logic + map save) ==== */
function generateCalendar(){
  if(isRendering)return; isRendering=true;
  const scrollY=window.scrollY;
  calendarGrid.innerHTML=''; dayCardMap.clear();
  const year=currentDate.getFullYear(), month=currentDate.getMonth();
  const mn=['January','February','March','April','May','June','July','August','September','October','November','December'];
  currentMonthYear.textContent=`${mn[month]} ${year}`;

  const firstDay=new Date(year,month,1);
  const lastDay=new Date(year,month+1,0);
  const startDay=firstDay.getDay()===0?7:firstDay.getDay();
  const daysInMonth=lastDay.getDate();
  const today=new Date();
  const db=JSON.parse(localStorage.getItem('db_mytable'))||{days:{}};

  requestAnimationFrame(()=>{
    for(let i=1;i<startDay;i++){
      const e=document.createElement('div'); e.className='day-card empty'; calendarGrid.appendChild(e);
    }
    for(let d=1; d<=daysInMonth; d++){
      const date=new Date(year,month,d); const key=formatDate(date);
      const data=calendarData[key]||{status:isWeekend(date)?'weekend':'working',points:0,ok:0,ber:0};
      calendarData[key]=data;
      const isToday=date.toDateString()===today.toDateString();
      const isTarget=workingDaysList.some(w=>w.dateKey===key);
      const hasRec=db.days[key]?.records?.length>0;
      const isNorm=+data.points>=dailyNorm;
      const card=document.createElement('div');
      card.className=`day-card ${data.status==='working'?'':data.status} ${isToday?'today':''} ${isTarget&&hasRec?'norm-met':''} ${isNorm?'norm-adapted':''}`;
      card.innerHTML=`<div class="day-card-header"><span class="day-card-title">${d} ${mn[month].slice(0,3)}</span></div>
        <div class="day-card-stats"><div>Shift: ${getShift(date)}</div><div class="points">Points: ${(+data.points).toFixed(2)}</div><div class="yield">Yield: ${data.ok+data.ber?((data.ok/(data.ok+data.ber))*100).toFixed(2):'0'}%</div></div>
        <div class="day-card-status"><select class="status-select" data-date="${key}">
          <option value="working" ${data.status==='working'?'selected':''}>Working</option>
          <option value="weekend" ${data.status==='weekend'?'selected':''}>Weekend</option>
          <option value="sick"    ${data.status==='sick'?'selected':''}>Sick Leave</option>
          <option value="absent"  ${data.status==='absent'?'selected':''}>Absent</option></select></div>`;

      // статус-select — обновляем ТОЛЬКО текущую карточку + summary
      card.querySelector('.status-select').addEventListener('change',e=>{
        const newStatus=e.target.value;
        calendarData[key].status=newStatus;
        localStorage.setItem('calendarData',JSON.stringify(calendarData));
        // визуальное обновление текущей карточки
        card.className=`day-card ${newStatus==='working'?'':newStatus} ${isToday?'today':''} ${isTarget&&hasRec?'norm-met':''} ${isNorm?'norm-adapted':''}`;
        updateSummary(year,month);
      });

      calendarGrid.appendChild(card); dayCardMap.set(key,card);
    }
    // trailing blanks
    const total=startDay-1+daysInMonth; const remain=(7-(total%7))%7;
    for(let i=0;i<remain;i++){ const e=document.createElement('div'); e.className='day-card empty'; calendarGrid.appendChild(e); }

    updateSummary(year,month);
    window.scrollTo(0,scrollY); isRendering=false;
    localStorage.setItem('calendarData',JSON.stringify(calendarData));
  });
}

/* ==== Debounced variant ==== */
const debouncedGenerateCalendar=debounce(generateCalendar,300);

/* ==== UI tabs/nav ==== */
document.querySelectorAll('.top-nav ul li').forEach(tab=>{
  tab.addEventListener('click',()=>{
    if(tab.dataset.tab==='calendar'){ container.classList.add('calendar-active'); debouncedGenerateCalendar(); }
    else{ container.classList.remove('calendar-active'); }
  });
});

prevMonthBtn.addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()-1); debouncedGenerateCalendar(); });
nextMonthBtn.addEventListener('click',()=>{ currentDate.setMonth(currentDate.getMonth()+1); debouncedGenerateCalendar(); });

/* ==== Initial draw ==== */
generateCalendar();
