document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("hasSeenWelcome") === "true") {
      const welcomeOverlay = document.getElementById("welcome-overlay");
      if (welcomeOverlay) {
        welcomeOverlay.remove();
      }
      return;
    }
  
    // Инициализация слайдов
    const slides = document.querySelectorAll(".slide");
    let currentSlide = 0;
    const nextButtons = document.querySelectorAll(".next-btn");
    const startBtn = document.getElementById("start-btn");
    const skipBtn = document.getElementById("skip-btn");
    const welcomeOverlay = document.getElementById("welcome-overlay");
  
    // Функция показа слайда по индексу
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
    }
  
    nextButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentSlide++;
        if (currentSlide < slides.length) {
          showSlide(currentSlide);
        }
      });
    });
  
    // Функция показа анимированного "Welcome" текста и плавного исчезновения overlay
    function showWelcomeAnimation() {
      localStorage.setItem("hasSeenWelcome", "true");
      // Очищаем содержимое overlay (слайды и прочее)
      welcomeOverlay.innerHTML = "";
      // Создаем элемент для анимированного текста
      const welcomeText = document.createElement("div");
      welcomeText.textContent = "Welcome";
      welcomeText.className = "welcome-text animate-in";
      welcomeOverlay.appendChild(welcomeText);
  
      setTimeout(() => {
        welcomeText.classList.remove("animate-in");
        welcomeText.classList.add("animate-out");
        setTimeout(() => {
          welcomeOverlay.style.animation = "fadeOut 1s ease forwards";
          setTimeout(() => {
            welcomeOverlay.remove();
          }, 1000);
        }, 1000);
      }, 1500);
    }
  
    startBtn.addEventListener("click", () => {
      showWelcomeAnimation();
    });
  
    skipBtn.addEventListener("click", () => {
      localStorage.setItem("hasSeenWelcome", "true");
      welcomeOverlay.remove();
    });
  
    showSlide(currentSlide);
  
    // ===================================================
    // Анимация заднего фона на canvas внутри welcome-overlay
    // ===================================================
  
    // Получаем canvas и контекст
    const canvas = document.getElementById("welcome-canvas");
    const ctx = canvas.getContext("2d");
  
    // Устанавливаем размеры canvas равными размеру overlay
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let width_half = width / 2;
    let height_half = height / 2;
    const TAU = 2 * Math.PI;
  
    // Определяем константы для градиента
    const ZERO = 0, THIRD = 0.33, TWO_THIRDS = 0.66, ONE = 1;
  
    // Композитный режим
    const compOper = { lighter: "lighter" };
  
    // Функция map
    function map(x, a, b, c, d) {
      return c + ((x - a) * (d - c)) / (b - a);
    }
  
    // Функция hsl – возвращает строку цвета
    function hsl(h, s, l, a) {
      if (a !== undefined) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
      }
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  
    // Функция для заливки фона
    function background(grad) {
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  
    // Функция stroke – устанавливает стиль и проводит обводку
    function strokeColor(color, lineWidth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  
    // Объект noise, например с использованием библиотеки SimplexNoise
    let noise = new SimplexNoise();
  
    // Функция draw – отрисовка анимированного заднего фона
    function draw(timeMs) {
      let xCount = 35;
      let yCount = 80;
      let iXCount = 1 / (xCount - 1);
      let iYCount = 1 / (yCount - 1);
      let time = timeMs * 0.001;
      let timeStep = 0.01;
      let grad = ctx.createLinearGradient(-width, 0, width, height);
      let t = time % 1;
      let tSide = Math.floor(time % 2) === 0;
      let hueA = tSide ? 340 : 210;
      let hueB = tSide ? 210 : 340;
      let colorA = hsl(hueA, 100, 50);
      let colorB = hsl(hueB, 100, 50);
      grad.addColorStop(map(t, 0, 1, THIRD, ZERO), colorA);
      grad.addColorStop(map(t, 0, 1, TWO_THIRDS, THIRD), colorB);
      grad.addColorStop(map(t, 0, 1, ONE, TWO_THIRDS), colorA);
      ctx.globalAlpha = map(Math.cos(time), -1, 1, 0.15, 0.3);
      background(grad);
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let j = 0; j < yCount; j++) {
        let tj = j * iYCount;
        let c = Math.cos(tj * TAU + time) * 0.1;
        for (let i = 0; i < xCount; i++) {
          let tVal = i * iXCount;
          let n = noise.noise3D(tVal, time, c);
          let y = n * height_half;
          let x = tVal * (width + 20) - width_half - 10;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        time += timeStep;
      }
      ctx.globalCompositeOperation = compOper.lighter;
      ctx.filter = 'blur(10px)';
      strokeColor(grad, 5);
      ctx.filter = 'blur(5px)';
      strokeColor(hsl(0, 0, 100, 0.8), 2);
      // Сбрасываем фильтр и композитный режим
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
    }
  
    // Анимационный цикл для canvas
    function animate() {
      draw(performance.now());
      requestAnimationFrame(animate);
    }
    animate();
  
    // Обработка изменения размеров окна
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      width_half = width / 2;
      height_half = height / 2;
    });
  });