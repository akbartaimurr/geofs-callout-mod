// ==UserScript==
// @name         GeoFS Callouts & Ad Removal
// @version      1.0
// @description  Removes ads and plays callouts based on instrument rotation in GeoFS
// @author       akbartai

// @credits       ad removal code: https://greasyfork.org/en/scripts/443618-geofs-ad-remover/code
// ==/UserScript==

(function() {
    'use strict';

    function removeElementsByClass(className) {
        const elements = document.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }


    removeElementsByClass("geofs-adbanner geofs-adsense-container");

    console.log("GeoFS ads removed. Starting rotation monitoring...");


    function getTargetElement() {
        const elements = document.querySelectorAll('.geofs-overlay.geofs-textOverlay.geofs-visible');
        return Array.from(elements).find(element =>
            element.style.backgroundImage.includes('images/instruments/small-hand.png') 
        );
    }


    const targetElement = getTargetElement();

    if (targetElement) {
        let initialRotateValue = extractRotateValue(targetElement.style.transform);
        let soundPlayed = {}; 


        function extractRotateValue(transformValue) {
            const match = transformValue.match(/rotate\(([^)]+)\)/);
            return match ? parseFloat(match[1]) : null;
        }


        function detectChanges(mutations) {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const newRotateValue = extractRotateValue(targetElement.style.transform);

                    console.clear();
                    console.log(`Rotate: ${newRotateValue}`);


                    handleSoundPlayback(newRotateValue >= 24 && newRotateValue <= 27, '100.mp3', '100');
                    handleSoundPlayback(newRotateValue >= 9 && newRotateValue <= 11, '50.mp3', '50');
                    handleSoundPlayback(newRotateValue >= 7 && newRotateValue <= 8, '40.mp3', '40');
                    handleSoundPlayback(newRotateValue >= 5 && newRotateValue <= 6, '30.mp3', '30');
                    handleSoundPlayback(newRotateValue >= 3 && newRotateValue <= 4, '20.mp3', '20');
                    handleSoundPlayback(newRotateValue >= 1 && newRotateValue <= 2, '10.mp3', '10');
                    handleSoundPlayback(newRotateValue >= 0 && newRotateValue <= 1, 'retard.mp3', 'retard');

                    initialRotateValue = newRotateValue;
                }
            });
        }


        function handleSoundPlayback(condition, fileName, key) {
            if (condition) {
                if (!soundPlayed[key]) {
                    playSoundEffect(`https://akbartai.web.app/geo-fs-callouts/${fileName}`, `soundEffect${key}`);
                    soundPlayed[key] = true;
                }
            } else {
                soundPlayed[key] = false; 
            }
        }


        function playSoundEffect(url, elementId) {
            let soundEffectElement = document.getElementById(elementId);

            if (!soundEffectElement) {
                soundEffectElement = document.createElement('audio');
                soundEffectElement.id = elementId;
                soundEffectElement.src = url;
                soundEffectElement.preload = 'auto';
                document.body.appendChild(soundEffectElement);
            }

            soundEffectElement.play().catch(() => {
                console.warn('Autoplay blocked! Click anywhere to enable sound.');
                document.addEventListener('click', () => {
                    soundEffectElement.play();
                    console.log('Sound autoplay enabled.');
                }, { once: true });
            });
        }


        const observer = new MutationObserver(detectChanges);
        observer.observe(targetElement, { attributes: true, attributeFilter: ['style'] });

        console.log('Observer is now monitoring changes to the rotate transformation.');
    } else {
        console.error('Target element with the specified image not found.');
    }
})();
