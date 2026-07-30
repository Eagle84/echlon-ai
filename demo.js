/**
 * Cinematic demo for the landing page.
 *
 * This is a scripted recreation of a REAL run: the timeline in demo-run.json is
 * extracted verbatim from an actual Echlon AI run log (a small "create greet.js
 * plus a test" job). Nothing here is invented — the messages, tool calls,
 * delegations and review verdicts are the ones the agents really produced.
 *
 * If a real screen recording is ever committed as demo.mp4, index.html plays
 * that instead and this script never runs.
 */
(() => {
  const stage = document.getElementById('demo-stage');
  if (!stage) return;

  const ROLES = {
    cto: { color: '#a78bfa', room: 'exec', label: 'CTO' },
    'dev-lead': { color: '#60a5fa', room: 'lead', label: 'Dev Lead' },
    'backend-dev': { color: '#fbbf24', room: 'dev', label: 'Backend' },
    'frontend-dev': { color: '#34d399', room: 'dev', label: 'Frontend' },
    'qa-engineer': { color: '#f472b6', room: 'qa', label: 'QA' },
    'automation-engineer': { color: '#22d3ee', room: 'qa', label: 'Automation' },
    'general-purpose': { color: '#94a3b8', room: 'ops', label: 'Ops' },
    system: { color: '#10b981', room: 'ops', label: 'System' },
  };

  // Desk anchors inside each room (percentages of the floor plate).
  const ROOMS = {
    exec: { x: 22, y: 26, seats: [[18, 26]] },
    lead: { x: 52, y: 26, seats: [[48, 26], [57, 26]] },
    dev: { x: 26, y: 72, seats: [[19, 70], [29, 74]] },
    qa: { x: 58, y: 72, seats: [[52, 70], [62, 74], [57, 78]] },
    ops: { x: 84, y: 72, seats: [[81, 72], [88, 74]] },
  };
  const ENTRANCE = [6, 50];
  const CORRIDOR_Y = 50;

  // The chrome bar (phase chips + clock) sits outside #demo-stage, so those
  // must be queried from the shell, not the stage.
  const shell = stage.closest('.demo-shell') ?? document;
  const feedEl = stage.querySelector('.demo-feed');
  const floorEl = stage.querySelector('.demo-floor');
  const phaseEls = [...shell.querySelectorAll('.demo-phase')];
  const clockEl = shell.querySelector('.demo-clock');

  const people = new Map();
  let seatUse = {};

  function takeSeat(room) {
    seatUse[room] = seatUse[room] ?? 0;
    const seats = ROOMS[room].seats;
    const seat = seats[Math.min(seatUse[room], seats.length - 1)];
    seatUse[room] += 1;
    return seat;
  }

  function spawn(role) {
    if (people.has(role)) return people.get(role);
    const meta = ROLES[role] ?? ROLES['general-purpose'];
    const el = document.createElement('div');
    el.className = 'demo-person';
    el.style.setProperty('--c', meta.color);
    el.innerHTML = `<i></i><b>${meta.label}</b>`;
    el.style.left = ENTRANCE[0] + '%';
    el.style.top = ENTRANCE[1] + '%';
    floorEl.appendChild(el);
    const person = { el, meta, seat: takeSeat(meta.room), bubble: null };
    people.set(role, person);
    return person;
  }

  function moveTo(person, x, y) {
    person.el.style.left = x + '%';
    person.el.style.top = y + '%';
  }

  function walkVia(person, target) {
    // Step out to the corridor first so people never cut through walls.
    moveTo(person, parseFloat(person.el.style.left), CORRIDOR_Y);
    setTimeout(() => moveTo(person, target[0], CORRIDOR_Y), 700);
    setTimeout(() => moveTo(person, target[0], target[1]), 1500);
  }

  function say(person, text, kind = 'speech') {
    if (person.bubble) person.bubble.remove();
    const b = document.createElement('div');
    b.className = 'demo-bubble' + (kind === 'thought' ? ' thought' : '');
    b.textContent = text.length > 90 ? text.slice(0, 87) + '…' : text;
    person.el.appendChild(b);
    person.bubble = b;
    setTimeout(() => {
      if (person.bubble === b) {
        b.classList.add('out');
        setTimeout(() => b.remove(), 400);
      }
    }, 4200);
  }

  function pushFeed(role, text, kind) {
    const meta = ROLES[role] ?? ROLES['general-purpose'];
    const row = document.createElement('div');
    row.className = 'demo-line ' + kind;
    row.innerHTML =
      `<span class="demo-role" style="color:${meta.color};border-color:${meta.color}">${meta.label}</span>` +
      `<span class="demo-text"></span>`;
    row.querySelector('.demo-text').textContent = text;
    feedEl.appendChild(row);
    while (feedEl.children.length > 9) feedEl.firstElementChild.remove();
    feedEl.scrollTop = feedEl.scrollHeight;
  }

  function setPhase(name) {
    const order = ['PLANNING', 'AWAITING_APPROVAL', 'EXECUTING', 'VALIDATING', 'DELIVERED'];
    const idx = order.indexOf(name);
    phaseEls.forEach((el, i) => {
      el.classList.toggle('done', idx > i);
      el.classList.toggle('now', idx === i);
    });
  }

  function reset() {
    people.forEach((p) => p.el.remove());
    people.clear();
    seatUse = {};
    feedEl.innerHTML = '';
    setPhase('');
    stage.classList.remove('celebrate');
  }

  /** Render one timeline event. Pure DOM work — no scheduling. */
  function applyEvent(e) {
    clockEl.textContent = e.t.toFixed(0).padStart(3, '0') + 's';

    if (e.k === 'phase') {
      setPhase(e.x);
      pushFeed('system', e.x.replace('_', ' '), 'phase');
      if (e.x === 'EXECUTING') {
        const lead = people.get('dev-lead');
        const cto = people.get('cto');
        if (lead && cto) {
          walkVia(lead, [ROOMS.exec.x + 6, ROOMS.exec.y]);
          setTimeout(() => say(cto, 'Approved — go build it'), 1600);
          setTimeout(() => walkVia(lead, lead.seat), 3200);
        }
      }
    } else if (e.k === 'hire') {
      const p = spawn(e.role);
      walkVia(p, [ROOMS.lead.x + 4, ROOMS.lead.y]);
      setTimeout(() => say(p, 'Reporting for duty'), 1500);
      setTimeout(() => walkVia(p, p.seat), 2600);
      pushFeed(e.role, 'joined the project', 'hire');
    } else if (e.k === 'msg') {
      const p = spawn(e.role);
      say(p, e.x);
      pushFeed(e.role, e.x, 'msg');
    } else if (e.k === 'tool') {
      pushFeed(e.role, e.x, 'tool');
    } else if (e.k === 'done') {
      const p = people.get(e.role);
      if (p) {
        walkVia(p, [ROOMS.lead.x + 4, ROOMS.lead.y]);
        setTimeout(() => walkVia(p, p.seat), 2400);
      }
    } else if (e.k === 'review') {
      const lead = people.get('dev-lead');
      if (lead) say(lead, e.x);
      pushFeed('dev-lead', e.x, e.x.includes('PASS') ? 'pass' : 'fail');
    } else if (e.k === 'done_run') {
      pushFeed('system', e.x, 'pass');
      stage.classList.add('celebrate');
      people.forEach((p) => say(p, '🎉'));
    }
  }

  let timers = [];
  function play(events) {
    timers.forEach(clearTimeout);
    timers = [];
    reset();

    // Leadership is already in the building.
    ['cto', 'dev-lead'].forEach((role) => {
      const p = spawn(role);
      moveTo(p, p.seat[0], p.seat[1]);
    });

    const SPEED = 26; // compress ~4 real minutes into ~9 seconds
    const end = events[events.length - 1].t;
    events.forEach((e) => timers.push(setTimeout(() => applyEvent(e), (e.t * 1000) / SPEED)));
    timers.push(setTimeout(() => play(events), (end * 1000) / SPEED + 5000)); // loop the reel
  }

  // Small debug surface: lets the reel be stepped without waiting on timers.
  window.__echlonDemo = { applyEvent, play, reset };

  fetch('demo-run.json')
    .then((r) => r.json())
    .then((events) => {
      // Play immediately. Pausing is driven by page visibility only —
      // an IntersectionObserver reports "not visible" in a non-compositing
      // tab and would cancel the reel the moment it started.
      play(events);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) timers.forEach(clearTimeout);
        else play(events);
      });
    })
    .catch(() => {
      stage.classList.add('demo-failed');
    });
})();
