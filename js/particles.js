(function () {
  const canvas = document.querySelector(".particle-background");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId = null;

  const config = {
    density: 8500,
    minCount: 45,
    maxCount: 130,
    speedMin: 0.04,
    speedMax: 0.11,
    connectDistance: 150,
    dotRadius: 2.2,
    dotColor: "23, 23, 23",
    dotOpacity: 0.24,
    lineOpacityMax: 0.14,
  };

  function createParticle(spreadAcrossScreen) {
    return {
      x: spreadAcrossScreen ? Math.random() * width : -30,
      y: Math.random() * height,
      vx: config.speedMin + Math.random() * (config.speedMax - config.speedMin),
      vy: (Math.random() - 0.5) * 0.024,
      radius: config.dotRadius,
    };
  }

  function initParticles() {
    const count = Math.min(
      config.maxCount,
      Math.max(config.minCount, Math.floor((width * height) / config.density))
    );

    particles = Array.from({ length: count }, () => createParticle(true));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();

    if (reducedMotion) {
      draw();
    }
  }

  function update() {
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      if (particle.x > width + 30) {
        particle.x = -30;
        particle.y = Math.random() * height;
        particle.vx = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      }
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= config.connectDistance) continue;

        const alpha = (1 - distance / config.connectDistance) * config.lineOpacityMax;
        ctx.strokeStyle = `rgba(${config.dotColor}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  function drawDots() {
    for (const particle of particles) {
      ctx.fillStyle = `rgba(${config.dotColor}, ${config.dotOpacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();
    drawDots();
  }

  function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();

  if (!reducedMotion) {
    loop();
  }

  document.addEventListener("visibilitychange", () => {
    if (reducedMotion) return;

    if (document.hidden) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return;
    }

    if (!animationId) {
      loop();
    }
  });
})();
