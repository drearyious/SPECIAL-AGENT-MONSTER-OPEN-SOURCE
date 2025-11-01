
Scene.prototype.getChoiceElements = function() {
    return document.querySelectorAll(
        "#choices-container a, #choiceSection a, form#optionsForm input[type='submit'], .choice"
    );
};

Scene.validCommands.screen_shake = 1;
Scene.validCommands.fade_in = 1;
Scene.validCommands.fade_scene = 1;
Scene.validCommands.fade_choices = 1;
Scene.validCommands.fade_in_choice = 1; 
Scene.validCommands.fade_line = 1;
Scene.validCommands.countdown_timer = 1;
Scene.validCommands.end_countdown_timer = 1;
Scene.validCommands.slow_type = 1;
Scene.validCommands.center = 1;
Scene.validCommands.centerbold = 1;
Scene.validCommands.intro_animation = 1;
Scene.validCommands.flash_screen = 1;
Scene.validCommands.scramble_text = 1;
Scene.validCommands.loading_dots = 1;
Scene.validCommands.emphasize_line = 1;

Scene.prototype._countdownInterval = null;
Scene.prototype._timerContainer = null;

Scene.prototype.fade_in = function fade_in(data) {
    const gameContent = document.getElementById("text");
    if (gameContent && gameContent.classList.contains("slow-typing")) {
        gameContent.style.transition = "none";
        gameContent.style.opacity = "1";
        console.log("fade_in overridden because slow_type is active");
        return;
    }
    

    const match = data.match(/(\d+)(?:\|(\d+))?/);
    if (!match) {
        throw new Error(this.lineMsg() + " Invalid fade_in command! Format: *fade_in duration|[optional_delay]");
    }

    const duration = parseInt(match[1]);
    const delay = match[2] !== undefined ? parseInt(match[2]) : 0;

    if (isNaN(duration) || duration <= 0) {
        throw new Error(this.lineMsg() + " Invalid duration!");
    }
    if (isNaN(delay) || delay < 0) {
        throw new Error(this.lineMsg() + " Invalid delay! Must be non-negative.");
    }

    console.log(`fade_in running with duration: ${duration} ms and delay: ${delay} ms`);
    const maxAttempts = 20;
    const pollInterval = 100;
    let attempts = 0;

    function attemptFadeIn() {
        const gameContent = document.getElementById("text");
        if (!gameContent) {
            attempts++;
            if (attempts < maxAttempts) {
                console.warn(`fade_in: Element with ID 'text' not found. Retrying attempt ${attempts}`);
                setTimeout(attemptFadeIn, pollInterval);
            } else {
                console.error("fade_in: Element with ID 'text' not found after multiple attempts.");
            }
            return;
        }
        console.log("fade_in: Found element #text");

        gameContent.style.transition = "";
        gameContent.style.opacity = "0";
        void gameContent.offsetWidth;


        gameContent.style.transition = `opacity ${duration / 1000}s ease-in-out`;

        setTimeout(() => {
            gameContent.style.opacity = "1";
            console.log("fade_in: Transition triggered (opacity set to 1)");
        }, delay);
    }

    attemptFadeIn();
};





Scene.prototype.center = function printCentered(text, fontSize = "18px") {
    var div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.width = "100%"; 
    div.style.fontStyle = "italic"; 
    div.style.fontSize = fontSize;
    div.textContent = text;
    
    var textContainer = document.getElementById("text");
    if (textContainer) {
        textContainer.appendChild(div);
    } else {
        console.warn("Element with ID 'text' not found.");
    }
};

Scene.prototype.centerbold = function printCentered1(text, fontSize = "14px") {
    var div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.width = "100%"; 
    div.style.fontWeight = "bold"; 
    div.style.fontStyle = "italic"; 
    div.style.fontSize = fontSize;
    div.textContent = text;
    
    var textContainer = document.getElementById("text");
    if (textContainer) {
        textContainer.appendChild(div);
    } else {
        console.warn("Element with ID 'text' not found.");
    }
};

Scene.prototype.shakePlayed = false;

function applyShake(target, intensity, duration) {
    let element = document.querySelector(target);
    if (!element) return;

    let startTime = Date.now();
    function shake() {
        let elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            element.style.transform = "";
            return;
        }
        let xOffset = (Math.random() * intensity * 2 - intensity) + "px";
        let yOffset = (Math.random() * intensity * 2 - intensity) + "px";
        element.style.transform = `translate(${xOffset}, ${yOffset})`;
        requestAnimationFrame(shake);
    }
    shake();
}

function applyShakeElement(element, intensity, duration) {
    let startTime = Date.now();
    function shake() {
        let elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            element.style.transform = "";
            return;
        }
        let xOffset = (Math.random() * intensity * 2 - intensity) + "px";
        let yOffset = (Math.random() * intensity * 2 - intensity) + "px";
        element.style.transform = `translate(${xOffset}, ${yOffset})`;
        requestAnimationFrame(shake);
    }
    shake();
}

Scene.prototype.screen_shake = function screen_shake(data) {
    if (this.shakePlayed) return;
    var splitdata = data.split("|");
    if (splitdata.length < 3) {
        throw new Error(this.lineMsg() + " Invalid screen_shake command! Format: *screen_shake target|intensity|duration");
    }

    var target = splitdata[0];
    var intensity = parseInt(splitdata[1]);
    var duration = parseInt(splitdata[2]);
    if (isNaN(intensity) || isNaN(duration) || intensity <= 0 || duration <= 0) {
        throw new Error(this.lineMsg() + " Invalid intensity or duration! Must be positive numbers.");
    }

    setTimeout(() => {
        if (target === "#choices") {
            var choiceElements = this.getChoiceElements();
            choiceElements.forEach(choice => {
                applyShakeElement(choice, intensity, duration);
            });
        } else {
            applyShake(target, intensity, duration);
        }
        this.shakePlayed = true;
    }, 500);
};

Scene.prototype.resetShake = function resetShake() {
    this.shakePlayed = false;
};

Scene.prototype.fade_scene = function fade_scene(data) {
    var duration = parseInt(data);
    if (isNaN(duration) || duration <= 0) {
        throw new Error(this.lineMsg() + " Invalid fade_scene command! Format: *fade_scene duration");
    }

    var sceneContent = document.getElementById("main");
    if (!sceneContent) return;

    this.resetShake();
    // set starting opacity again
    sceneContent.style.opacity = 0;
    setTimeout(() => {
        sceneContent.style.transition = `opacity ${duration / 1000}s ease-in-out`;
        sceneContent.style.opacity = 1;
    }, 50);
};

Scene.prototype.fade_choices = function fade_choices(data) {
    var duration = parseInt(data);
    if (isNaN(duration) || duration <= 0) {
        throw new Error(this.lineMsg() + " Invalid fade_choices command! Format: *fade_choices duration");
    }

    var maxAttempts = 20; // try up to 20 times (adjust as needed)
    var pollInterval = 100; // interval in ms between attempts :moneymoney:
    var attempts = 0;

    var applyFade = () => {
        var choiceElements = this.getChoiceElements();
        if (choiceElements.length > 0) {
            console.log("fade_choices: Found", choiceElements.length, "choice elements after", attempts, "attempts.");
            // Set initial state
            choiceElements.forEach(choice => {
                choice.style.opacity = 0;
                choice.style.transition = `opacity ${duration / 1000}s ease-in-out`;
            });
            // Force reflow
            if (choiceElements[0]) void choiceElements[0].offsetWidth;
            // Trigger fade in after a short delay
            setTimeout(() => {
                choiceElements.forEach(choice => {
                    choice.style.opacity = 1;
                });
                console.log("fade_choices: Transition triggered.");
            }, 50);
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(applyFade, pollInterval);
            } else {
                console.warn("fade_choices: No choice elements found after waiting.");
            }
        }
    };

    applyFade();
};


Scene.prototype.fade_in_choice = Scene.prototype.fade_choices;

Scene.prototype.fade_line = function fade_line(data) {
    var match = data.match(/"(.*?)"\|(\d+)/);
    if (!match) {
        throw new Error(this.lineMsg() + " Invalid fade_line command! Format: *fade_line \"text\"|duration");
    }

    var textToFade = match[1];
    var duration = parseInt(match[2]);
    var textElements = document.querySelectorAll("#text p");
    let found = false;

    textElements.forEach(paragraph => {
        if (paragraph.textContent.includes(textToFade)) {
            found = true;
            let regex = new RegExp(`(${textToFade})`, "g");
            paragraph.innerHTML = paragraph.innerHTML.replace(regex, '<span class="fade-target">$1</span>');
            let span = paragraph.querySelector(".fade-target");
            if (span) {
                span.style.opacity = 0;
                span.style.transition = `opacity ${duration / 1000}s ease-in-out`;
                setTimeout(() => {
                    span.style.opacity = 1;
                }, 50);
            }
        }
    });
    if (!found) {
        throw new Error(this.lineMsg() + ` No matching text found for fade_line: "${textToFade}"`);
    }
};

Scene.prototype.countdown_timer = function countdown_timer(data) {
    var splitdata = data.split("|");
    if (splitdata.length < 2) {
        throw new Error(this.lineMsg() + " Invalid countdown_timer command! Format: *countdown_timer duration|action");
    }

    var duration = parseInt(splitdata[0]);
    var action = splitdata[1];

    if (isNaN(duration) || duration <= 0) {
        throw new Error(this.lineMsg() + " Invalid duration! Must be a positive number.");
    }

    function flashScreen(color, delay) {
        setTimeout(() => {
            var flash = document.createElement("div");
            flash.style.position = "fixed";
            flash.style.top = "0";
            flash.style.left = "0";
            flash.style.width = "100%";
            flash.style.height = "100%";
            flash.style.background = color;
            flash.style.opacity = "0.7";
            flash.style.zIndex = "9999";
            flash.style.transition = "opacity 0.3s ease-out";
            document.body.appendChild(flash);
            setTimeout(() => flash.style.opacity = "0", 200);
            setTimeout(() => { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 500);
        }, delay);
    }

    flashScreen("rgba(255, 200, 100, 0.8)", 50);
    flashScreen("rgba(255, 200, 100, 0.8)", 400);

    setTimeout(() => {
        var timerContainer = document.createElement("div");
        timerContainer.className = "timer-container";
        timerContainer.style.top = "-200px";
        timerContainer.style.left = "50%";
        timerContainer.style.transform = "translateX(-50%)";
        timerContainer.style.zIndex = "1000";
        document.body.appendChild(timerContainer);

        var cautionTop = document.createElement("div");
        cautionTop.className = "timer-caution";
        timerContainer.appendChild(cautionTop);

        var timerDisplay = document.createElement("div");
        timerDisplay.className = "timer-display";
        timerDisplay.textContent = Math.ceil(duration / 1000);
        timerContainer.appendChild(timerDisplay);

        var cautionBottom = document.createElement("div");
        cautionBottom.className = "timer-caution";
        timerContainer.appendChild(cautionBottom);

        setTimeout(() => {
            timerContainer.style.top = "20px";
            timerContainer.style.animation = "shake 0.5s infinite alternate, pulseGlow 1s infinite alternate";
        }, 100);

        if (!document.getElementById("timer-keyframes")) {
            var style = document.createElement("style");
            style.id = "timer-keyframes";
            style.innerHTML = `
                @keyframes shake {
                    0% { transform: translateX(-50%) translateY(0px); }
                    25% { transform: translateX(-50%) translateY(-4px); }
                    50% { transform: translateX(-50%) translateY(4px); }
                    75% { transform: translateX(-50%) translateY(-4px); }
                    100% { transform: translateX(-50%) translateY(0px); }
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8); }
                    50% { box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.5); }
                    100% { box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8); }
                }
            `;
            document.head.appendChild(style);
        }

        var timeLeft = Math.ceil(duration / 1000);
        var sceneRef = this;

        this._countdownInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(sceneRef._countdownInterval);

                timerContainer.style.transition = "top 0.3s ease, opacity 0.3s";
                timerContainer.style.top = "150%";
                timerContainer.style.opacity = "0";

                setTimeout(() => {
                    if (timerContainer.parentNode) timerContainer.parentNode.removeChild(timerContainer);

                    try {
                        var trimmed = action.trim();
                        if (!trimmed) throw new Error("Empty action.");
                        var parts = trimmed.split(/\s+/);
                        var sceneName = parts[0];
                        var label = parts[1] || null;

                        sceneRef.finished = true;

                        if (sceneName.startsWith("#")) {
                            // Jump to label within same scene
                            sceneRef.goto(sceneName.substring(1));
                            sceneRef.refresh();
                            return;
                        }

                        // ✅ OFFICIAL GOTO_SCENE REPLICA
                        sceneRef.parsedSceneName = sceneName;
                        sceneRef.parsedLabel = label;
                        if (typeof sceneRef.navigator === "object" && typeof sceneRef.navigator.gotoScene === "function") {
                            sceneRef.navigator.gotoScene(sceneName, label);
                        } else if (window.nav && typeof window.nav.gotoScene === "function") {
                            window.nav.gotoScene(sceneName, label);
                        } else if (typeof Scene.prototype.loadScene === "function") {
                            // fallback if nothing else works
                            Scene.prototype.loadScene.call(sceneRef, sceneName, label);
                            sceneRef.refresh();
                        } else {
                            console.error("countdown_timer: could not find any valid navigation method.");
                        }

                    } catch (err) {
                        console.error("countdown_timer navigation error:", err);
                    }
                }, 300);
            }



        }, 1000);
    }, 600);
};

Scene.prototype.flash_screen = function flash_screen(data) {
    var match = data.match(/(white|black|red|blue|purple)?\|?(\d+)?/);
    var color = match[1] || "white";
    var duration = parseInt(match[2]) || 300;

    const flash = document.createElement("div");
    Object.assign(flash.style, {
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        background: color, zIndex: 9999,
        opacity: "1", transition: `opacity ${duration}ms ease`
    });
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = "0"; }, 50);
    setTimeout(() => flash.remove(), duration + 200);
};

Scene.prototype.scramble_text = function scramble_text(data) {
    const match = data.match(/"(.*?)"\|(\d+)/);
    if (!match) throw new Error(this.lineMsg() + " Invalid format: *scramble_text \"text\"|duration");
    const target = match[1];
    const duration = parseInt(match[2]);
    const el = document.createElement("p");
    document.getElementById("text").appendChild(el);

    const chars = "!@#$%^&*()_+{}[]<>?/|~-=^%$#".split('');
    const start = performance.now();
    const scramblePhase = duration * 0.7; // 70% of total duration
    const revealPhase = duration * 0.3;
    const totalChars = target.length;
    let displayed = new Array(totalChars).fill('');

    function update() {
        const now = performance.now();
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);

        // gradually increase intensity
        if (elapsed < scramblePhase) {
            const intensity = Math.min(1, elapsed / scramblePhase);
            for (let i = 0; i < totalChars; i++) {
                if (Math.random() < intensity) {
                    displayed[i] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }

        // snap into place over time
        else {
            const revealProgress = (elapsed - scramblePhase) / revealPhase;
            const revealCount = Math.floor(revealProgress * totalChars);
            for (let i = 0; i < totalChars; i++) {
                if (i < revealCount) displayed[i] = target[i];
                else if (Math.random() < 0.5) {
                    displayed[i] = chars[Math.floor(Math.random() * chars.length)];
                }
            }
        }

        el.textContent = displayed.join('');

        // continue until done
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
};


Scene.prototype.loading_dots = function loading_dots(data) {
    const match = data.match(/"(.*?)"\|(\d+)\|"(.*?)"/);
    if (!match) throw new Error(this.lineMsg() +
        ' Invalid format! Use: *loading_dots "text"|duration|"result text"');

    const baseText = match[1];
    const duration = parseInt(match[2], 10);
    const finalText = match[3];
    const scene = this;

    // create paragraph safely
    let line = null;
    try { line = scene.paragraph(); } catch (_) {}
    if (!line) {
        const container = document.getElementById('text') ||
            document.querySelector('#game') ||
            document.querySelector('#output') ||
            document.body;
        line = document.createElement('p');
        container.appendChild(line);
    }
    line.textContent = baseText;

    let capturedResume = null;
    Object.defineProperty(scene, "finishedCallback", {
        configurable: true,
        enumerable: true,
        get() { return capturedResume; },
        set(fn) { capturedResume = fn; },
    });

    function resumeEngine() {
        if (!capturedResume) return;
        try {
            if (typeof capturedResume === "function") {
                capturedResume();
            } else if (typeof capturedResume.resume === "function") {
                capturedResume.resume();
            } else if (typeof scene.finishedCallback === "function") {
                scene.finishedCallback();
            } else if (scene.finishedCallback && typeof scene.finishedCallback.resume === "function") {
                scene.finishedCallback.resume();
            } else {
                console.warn("loading_dots: could not find resume function", capturedResume);
            }
        } catch (err) {
            console.error("loading_dots resume error:", err);
        }
    }

    // animate
    let dots = 0;
    let direction = 1;
    const start = performance.now();

    function animate() {
        const elapsed = performance.now() - start;
        if (elapsed < duration) {
            dots += direction;
            if (dots > 3) { dots = 3; direction = -1; }
            if (dots < 0) { dots = 0; direction = 1; }
            line.textContent = baseText + '.'.repeat(dots);
            setTimeout(animate, 300);
        } else {
            line.textContent = baseText + '...';
            const result = scene.paragraph ? scene.paragraph() : document.createElement('p');
            result.style.opacity = 0;
            result.style.transition = "opacity 800ms ease";
            result.style.fontWeight = "bold";
            result.textContent = finalText;
            setTimeout(() => (result.style.opacity = 1), 100);

            // resume after fade
            setTimeout(resumeEngine, 900);
        }
    }

    animate();
    return true; // pause ChoiceScript, DOESNT FUCKING WORK
};






Scene.prototype.emphasize_line = function emphasize_line(data) {

    var match = data.match(/"(.*?)"(?:\|(\d+))?/);
    if (!match) {
        throw new Error(this.lineMsg() + " Invalid emphasize_line command! Format: *emphasize_line \"text\"|size");
    }

    let textToEmphasize = match[1];
    let fontSize = match[2] ? parseInt(match[2]) : 150; 

    textToEmphasize = textToEmphasize.replace(/\${(.*?)}/g, (full, varName) => {
        varName = varName.trim();
        if (this.stats.hasOwnProperty(varName)) {
            return this.stats[varName];
        } else {
            console.warn(`emphasize_line: Unknown variable ${varName}`);
            return full; // leave as-is if not found
        }
    });


    const textElements = document.querySelectorAll("#text p");
    let found = false;

    textElements.forEach(paragraph => {
        if (paragraph.textContent.includes(textToEmphasize)) {
            found = true;
            const regex = new RegExp(`(${textToEmphasize.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "g");
            paragraph.innerHTML = paragraph.innerHTML.replace(regex, `<span class="emphasize-target">$1</span>`);
        }
    });

    if (!found) {
        throw new Error(this.lineMsg() + ` No matching text found for emphasize_line: "${textToEmphasize}"`);
    }


    document.querySelectorAll(".emphasize-target").forEach(span => {
        span.style.fontWeight = "bold";
        span.style.fontSize = fontSize + "%";
        span.style.transition = "all 0.3s ease-in-out";
    });
};



Scene.prototype.slow_type = function slow_type(data) {
    var match = data.match(/"(.*?)"\|(\d+)(?:\|(\d+))?/);
    if (!match) {
        throw new Error(this.lineMsg() +
            " Invalid slow_type command! Format: *slow_type \"text\"|speed|[delay]");
    }

    var textToType = match[1];
    var speed = parseInt(match[2]);
    var delay = match[3] !== undefined ? parseInt(match[3]) : 0;

    if (isNaN(speed) || speed <= 0) {
        throw new Error(this.lineMsg() + " Invalid speed! Must be a positive number.");
    }
    if (isNaN(delay) || delay < 0) {
        throw new Error(this.lineMsg() + " Invalid delay! Must be a non-negative number.");
    }

    var gameContent = document.getElementById("text");
    if (!gameContent) return;

    this.slowTypingActive = true;

    gameContent.style.transition = "none";
    gameContent.style.opacity = "1";
    gameContent.offsetHeight; // force reflow

    var paragraph = document.createElement("p");
    gameContent.appendChild(paragraph);

    const self = this; // capture reference to the current Scene instance

    let index = 0;
    function typeCharacter() {
        if (index < textToType.length) {
            paragraph.textContent += textToType.charAt(index);
            index++;
            setTimeout(typeCharacter, speed);
        } else {
            self.slowTypingActive = false; // use self instead of scene
        }
    }

    setTimeout(typeCharacter, delay);
};



Scene.prototype.end_countdown_timer = function end_countdown_timer(data) {
    if (this._countdownInterval !== null) {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
    }
    var now = Date.now();
    var timeElapsed = now - (this._countdownStartTime || now); 
    var duration = this._countdownDuration || 1000; 
    var reactionSpeed = Math.max(0, duration - timeElapsed); // in ms
    var performance = Math.min(1, reactionSpeed / duration);

    this.showPerfectAnimation(performance);

    if (this._timerContainer !== null) {
        this._timerContainer.style.transition = "top 0.3s cubic-bezier(0.8, 0, 1, 0.2), opacity 0.3s";
        this._timerContainer.style.top = "150%";
        this._timerContainer.style.opacity = "0";
        setTimeout(() => {
            if (this._timerContainer && document.body.contains(this._timerContainer)) {
                document.body.removeChild(this._timerContainer);
                this._timerContainer = null;
            }
        }, 300);
    }
};

Scene.prototype.showPerfectAnimation = function(performance) {
    let grade, color, textShadow, animations, textEffect;
    if (performance > 0.85) {
        grade = "EXCELLENT";
        color = "rgba(255, 100, 50, 1)";
        textShadow = "0 0 20px rgba(255, 50, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.5), 0 0 60px rgba(255, 200, 0, 0.4)";
        textEffect = [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
            { transform: "translate(-50%, -50%) scale(1.5)", opacity: 1, offset: 0.3 },
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.7 },
            { transform: "translate(-50%, -50%) scale(0.7)", opacity: 0 }
        ];
        animations = {
            duration: 2000,
            easing: "cubic-bezier(0.25, 1.5, 0.5, 1)"
        };
    } else if (performance > 0.6) {
        grade = "OK";
        color = "rgba(100, 200, 255, 1)";
        textShadow = "0 0 15px rgba(50, 150, 255, 0.7), 0 0 30px rgba(100, 200, 255, 0.4)";
        textEffect = [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
            { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: 0.3 },
            { transform: "translate(-50%, -50%) scale(0.9)", opacity: 1, offset: 0.7 },
            { transform: "translate(-50%, -50%) scale(0.7)", opacity: 0 }
        ];
        animations = {
            duration: 1500,
            easing: "ease-out"
        };
    } else if (performance > 0.3) {
        grade = "MEH";
        color = "rgba(255, 200, 0, 1)";
        textShadow = "0 0 10px rgba(255, 200, 0, 0.5), 0 0 20px rgba(255, 150, 0, 0.3)";
        textEffect = [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
            { transform: "translate(-50%, -50%) scale(0.9)", opacity: 1, offset: 0.3 },
            { transform: "translate(-50%, -50%) scale(1)", opacity: 0.7, offset: 0.5 },
            { transform: "translate(-50%, -50%) scale(0.8)", opacity: 0 }
        ];
        animations = {
            duration: 1200,
            easing: "ease-in-out"
        };
    } else {
        grade = "TOO SLOW";
        color = "rgba(180, 0, 0, 1)";
        textShadow = "0 0 15px rgba(255, 0, 0, 0.6), 0 0 30px rgba(100, 0, 0, 0.3)";
        textEffect = [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0, filter: "blur(2px)" },
            { transform: "translate(-50%, -50%) scale(1.1)", opacity: 1, filter: "blur(0px)", offset: 0.2 },
            { transform: "translate(-50%, -50%) scale(0.9)", opacity: 0.5, filter: "blur(2px)", offset: 0.6 },
            { transform: "translate(-50%, -50%) scale(0.7)", opacity: 0, filter: "blur(3px)" }
        ];
        animations = {
            duration: 1000,
            easing: "steps(3, end)" 
        };
    }

    var gradeText = document.createElement("div");
    gradeText.textContent = grade;
    gradeText.style.position = "fixed";
    gradeText.style.left = "50%";
    gradeText.style.top = "50%";
    gradeText.style.transform = "translate(-50%, -50%) scale(0)";
    gradeText.style.fontSize = "100px";
    gradeText.style.fontWeight = "900";
    gradeText.style.color = color;
    gradeText.style.textShadow = textShadow;
    gradeText.style.zIndex = "10000";
    gradeText.style.opacity = "0";

    document.body.appendChild(gradeText);

    var shakeContainer = document.createElement("div");
    shakeContainer.style.position = "fixed";
    shakeContainer.style.top = "0";
    shakeContainer.style.left = "0";
    shakeContainer.style.width = "100%";
    shakeContainer.style.height = "100%";
    shakeContainer.style.zIndex = "9999";
    document.body.appendChild(shakeContainer);
    shakeContainer.appendChild(gradeText);

    gradeText.animate(textEffect, animations);

    if (grade === "EXCELLENT") {
        gradeText.animate([
            { textShadow: "0 0 20px gold" },
            { textShadow: "0 0 60px gold" },
            { textShadow: "0 0 20px gold" }
        ], {
            duration: 800,
            iterations: 3
        });
        shakeContainer.animate([
            { transform: "translate(0px, 0px)" },
            { transform: "translate(10px, -10px)" },
            { transform: "translate(-10px, 10px)" },
            { transform: "translate(6px, -6px)" },
            { transform: "translate(0px, 0px)" }
        ], {
            duration: 500
        });
    } else if (grade === "OK") {
        gradeText.animate([
            { textShadow: "0 0 10px cyan" },
            { textShadow: "0 0 30px cyan" },
            { textShadow: "0 0 10px cyan" }
        ], {
            duration: 600,
            iterations: 2
        });
        shakeContainer.animate([
            { transform: "translate(0px, 0px)" },
            { transform: "translate(4px, -4px)" },
            { transform: "translate(-4px, 4px)" },
            { transform: "translate(0px, 0px)" }
        ], {
            duration: 300
        });
    } else if (grade === "MEH") {
        gradeText.animate([
            { opacity: 1 },
            { opacity: 0.4 },
            { opacity: 1 }
        ], {
            duration: 400,
            iterations: 2
        });
        shakeContainer.animate([
            { transform: "translate(0px, 0px)" },
            { transform: "translate(2px, -2px)" },
            { transform: "translate(-2px, 2px)" },
            { transform: "translate(0px, 0px)" }
        ], {
            duration: 200
        });
    } else if (grade === "TOO SLOW") {
        var flash = document.createElement("div");
        flash.style.position = "fixed";
        flash.style.top = "0";
        flash.style.left = "0";
        flash.style.width = "100%";
        flash.style.height = "100%";
        flash.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        flash.style.zIndex = "9998";
        flash.style.pointerEvents = "none";
        document.body.appendChild(flash);
        flash.animate([
            { opacity: 0.2 },
            { opacity: 0 }
        ], {
            duration: 500
        });
        setTimeout(() => {
            if (document.body.contains(flash)) {
                document.body.removeChild(flash);
            }
        }, 600);
    }

    setTimeout(() => {
        if (document.body.contains(shakeContainer)) {
            document.body.removeChild(shakeContainer);
        }
    }, 2200);
};

Scene.prototype.intro_animation = function intro_animation(data) {

    // intro play once
    if (window.localStorage.getItem("introPlayed") === "true") {
        console.log("Intro already played. Skipping animation.");

        this.goto("next_scene");  
        return;
    }

    window.localStorage.setItem("introPlayed", "true");


    console.log("intro_animation command triggered");
    this.introAnimating = true; 


    // 1. create a full-screen overlay, fade-in
    var overlay = document.createElement("div");
    overlay.id = "intro-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.zIndex = "9999";
    overlay.style.overflow = "hidden";
    overlay.style.background = "white"; 

    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 1s ease";
    document.body.appendChild(overlay);


    setTimeout(function() {
        overlay.style.opacity = "1";
    }, 50);


    var initialPause = 1000; 
    setTimeout(function() {

        // 2. create the logo container 
        var logoContainer = document.createElement("div");
        logoContainer.id = "logo-container";
        logoContainer.style.position = "absolute";
        logoContainer.style.top = "50%";
        logoContainer.style.left = "50%";
        logoContainer.style.transform = "translate(-50%, -50%)";
        const aspectRatio = 1150 / 800; // width / height
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;

        let logoWidth = maxWidth;
        let logoHeight = logoWidth / aspectRatio;
        if (logoHeight > maxHeight) {
            logoHeight = maxHeight;
            logoWidth = logoHeight * aspectRatio;
        }

        logoContainer.style.width = logoWidth + "px";
        logoContainer.style.height = logoHeight + "px";
        logoContainer.style.overflow = "hidden"; 
        logoContainer.style.zIndex = "10000";
        overlay.appendChild(logoContainer);


        var logoInner = document.createElement("div");
        logoInner.id = "logo-inner";
        logoInner.style.position = "absolute";
        logoInner.style.top = "0";
        logoInner.style.left = "0";
        logoInner.style.width = "100%";
        logoInner.style.height = "100%";
        logoInner.style.overflow = "hidden";
        logoContainer.appendChild(logoInner);


        // 3. load the logo 
        var img = new Image();
        img.src = "images/samLogo.png"; // maybe adjust path later
        img.onload = function() {
            console.log("images/samLogo.png loaded successfully");
            var containerWidth = logoContainer.offsetWidth;
            var containerHeight = logoContainer.offsetHeight;
            var bgSize = containerWidth + "px " + containerHeight + "px";


            // 4. create slices
            var sliceCount = 10;
            var sliceWidthPercent = 100 / sliceCount;
            var slices = [];

            function createSlice(index) {
                var slice = document.createElement("div");
                slice.style.position = "absolute";
                slice.style.top = "0";
                slice.style.left = (index * sliceWidthPercent) + "%";
                slice.style.width = sliceWidthPercent + "%";
                slice.style.height = "100%";
                slice.style.backgroundImage = "url('images/samLogo.png')";
                slice.style.backgroundSize = bgSize;
                slice.style.backgroundRepeat = "no-repeat";


                var xOffset = -(containerWidth * index / sliceCount) + "px";
                slice.style.backgroundPosition = xOffset + " 0";


                var randomDirection = Math.floor(Math.random() * 4);
                var xTranslate = 0, yTranslate = 0;

                switch (randomDirection) {
                    case 0: 
                        xTranslate = -containerWidth * 1.2;
                        break;
                    case 1: 
                        xTranslate = containerWidth * 1.2;
                        break;
                    case 2: 
                        yTranslate = -containerHeight * 1.2;
                        break;
                    case 3: 
                        yTranslate = containerHeight * 1.2;
                        break;
                }


                var randomRot = (Math.random() * 90 - 45) + "deg";
                slice.style.transform = `translate(${xTranslate}px, ${yTranslate}px) rotate(${randomRot})`;
                slice.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
                return slice;
            }

            for (var i = 0; i < sliceCount; i++) {
                var newSlice = createSlice(i);
                slices.push(newSlice);
                logoInner.appendChild(newSlice);
            }


            // 5. animated slices with mini shake
            var baseDelay = 200; 
            slices.forEach(function(slice, i) {
                var delay = i * baseDelay;
                setTimeout(function() {
                    slice.style.transform = "translate(0, 0) rotate(0deg)";
                    var sliceSound = new Audio("slice_hit.mp3");
                    sliceSound.play().catch(function(error) {
                        console.error("slice_hit.mp3 error:", error);
                    });
                    applyShake("#logo-inner", 6, 80);
                }, delay);
            });

            var totalSliceTime = (sliceCount - 1) * baseDelay + 800;


            // 6. big shake
            var pauseAfterAssembly = 1200; 
            setTimeout(function() {
                console.log("Triggering final impact effects");
                var impactSound = new Audio("impact.mp3");
                impactSound.play().catch(function(error) {
                    console.error("impact.mp3 error:", error);
                });
                applyShake("#logo-inner", 20, 500);


                // 7. shine effect
                var shineBar = document.createElement("div");
                shineBar.style.position = "absolute";
                shineBar.style.top = "0";
                shineBar.style.left = "-20%";
                shineBar.style.width = "20%";
                shineBar.style.height = "100%";
                shineBar.style.background = "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)";
                shineBar.style.mixBlendMode = "screen";
                shineBar.style.opacity = "0";
                shineBar.style.transition = "left 0.7s ease-out, opacity 0.7s ease-out";
                logoInner.appendChild(shineBar);

                setTimeout(function() {
                    shineBar.style.opacity = "1";
                    shineBar.style.left = "100%";
                }, 50);
                setTimeout(function() {
                    shineBar.style.opacity = "0";
                }, 750);


                // 8. type in the credits at the bottom
                var creditBox = document.createElement("div");
                creditBox.style.position = "absolute";
                creditBox.style.bottom = "0";
                creditBox.style.left = "50%";
                creditBox.style.transform = "translateX(-50%)";
                creditBox.style.fontFamily = "'Courier New', monospace"; 
                creditBox.style.fontSize = "1vw";
                creditBox.style.color = "#000";
                creditBox.style.background = "rgba(255,255,255,0.7)";
                creditBox.style.padding = "5px 10px";
                creditBox.style.borderRadius = "4px";
                creditBox.style.opacity = "0";
                creditBox.style.transition = "opacity 0.5s ease";
                logoContainer.appendChild(creditBox);


                var creditsText = "Written and Created By: Drearyious";
                var index = 0;


                setTimeout(function() {
                    creditBox.style.opacity = "1";
                    typeText(creditBox, creditsText, 50);
                }, 800);

            }.bind(this), totalSliceTime + pauseAfterAssembly);


            // 9. fade in final overlay with "continue" button (still 2s after the typed credits appear, so 2.8s)
            setTimeout(function() {
                var fadeOverlay = document.createElement("div");
                fadeOverlay.style.position = "fixed";
                fadeOverlay.style.top = "0";
                fadeOverlay.style.left = "0";
                fadeOverlay.style.width = "100vw";
                fadeOverlay.style.height = "100vh";
                fadeOverlay.style.background = "white"; 
                fadeOverlay.style.opacity = "0";
                fadeOverlay.style.zIndex = "11000";
                fadeOverlay.style.transition = "opacity 1s ease";
                document.body.appendChild(fadeOverlay);


                setTimeout(function() {
                    fadeOverlay.style.opacity = "0.85";
                }, 50);

                var btnContainer = document.createElement("div");
                btnContainer.style.position = "absolute";
                btnContainer.style.top = "50%";
                btnContainer.style.left = "50%";
                btnContainer.style.transform = "translate(-50%, -50%)";
                fadeOverlay.appendChild(btnContainer);

                var continueBtn = document.createElement("button");
                continueBtn.textContent = "Continue";
                continueBtn.classList.add("next");
                continueBtn.style.width = "auto";
                continueBtn.style.padding = "12px 24px";
                continueBtn.style.fontSize = "1.2em";
                continueBtn.style.border = "2px solid #000";
                continueBtn.style.background = "#fff";
                continueBtn.style.color = "#000";
                continueBtn.style.cursor = "pointer";
                continueBtn.onclick = function() {

                    fadeOverlay.style.opacity = "0";
                    overlay.style.opacity = "0";

                    setTimeout(function() {
                        if (document.body.contains(fadeOverlay)) {
                            document.body.removeChild(fadeOverlay);
                        }
                        if (document.body.contains(overlay)) {
                            document.body.removeChild(overlay);
                        }
                        this.goto("next_scene");
                    }.bind(this), 1000); 
                }.bind(this);
                btnContainer.appendChild(continueBtn);

            }.bind(this), totalSliceTime + pauseAfterAssembly + 2800);


            setTimeout(function() {
                this.introAnimating = false;
                console.log("Intro animation complete (awaiting user click).");
            }.bind(this), totalSliceTime + pauseAfterAssembly + 4000);

        }.bind(this);

        img.onerror = function() {
            console.error("Failed to load images/samLogo.png");
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            this.introAnimating = false;
        }.bind(this);

    }.bind(this), initialPause);

    // TYPE TEXT HELPER
    function typeText(element, text, speed) {
        var i = 0;
        var interval = setInterval(function() {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, speed);
    }
};

Scene.validCommands.shake_line = 1;

Scene.prototype.shake_line = function shake_line(data) {
  const match = data.match(/"(.*?)"\|(\d+)\|(\d+)/);
  if (!match) {
    throw new Error(
      this.lineMsg() +
        ' Invalid shake_line command! Format: *shake_line "text"|intensity|duration'
    );
  }

  const textToShake = match[1];
  const intensity = parseInt(match[2]);
  const duration = parseInt(match[3]);

  if (isNaN(intensity) || intensity <= 0 || isNaN(duration) || duration <= 0) {
    throw new Error(
      this.lineMsg() +
        " Invalid intensity or duration! Both must be positive numbers."
    );
  }

  let attempts = 0;
  const maxAttempts = 10;

  function applyShakeEffect() {
    const paragraphs = document.querySelectorAll("#text p");
    let found = false;

    paragraphs.forEach((paragraph) => {
      if (paragraph.textContent.includes(textToShake)) {
        found = true;
        const span = wrapTextInElement(paragraph, textToShake);
        if (span) {
          console.log("Applying shake to element:", span);
          applyShakeElement(span, intensity, duration);
        } else {
          console.log("Text found, but span was not created.");
        }
      }
    });

    if (!found && attempts < maxAttempts) {
      attempts++;
      setTimeout(applyShakeEffect, 100);
    } else if (!found) {
      console.error(
        `shake_line: No matching text found for "${textToShake}" after ${maxAttempts} attempts.`
      );
    }
  }

  setTimeout(applyShakeEffect, 100);
};


function wrapTextInElement(element, searchText) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const index = node.nodeValue.indexOf(searchText);
    if (index !== -1) {
      const span = document.createElement("span");
      span.className = "shake-target";
      span.style.display = "inline-block";
      const before = document.createTextNode(node.nodeValue.substring(0, index));
      const matched = document.createTextNode(searchText);
      const after = document.createTextNode(node.nodeValue.substring(index + searchText.length));
      const parent = node.parentNode;
      parent.insertBefore(before, node);
      parent.insertBefore(span, node);
      span.appendChild(matched);
      parent.insertBefore(after, node);
      parent.removeChild(node);
      return span;
    }
  }
  return null;
}

