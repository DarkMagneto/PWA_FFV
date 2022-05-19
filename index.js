
/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(function (registration) {
    // Registration Success
    console.log('[serviceWorker]: registration successful with scope: ', registration.scope);
  }).catch(function (err) {
    // Registration failed :(
    console.log('[serviceWorker] registration failed', err);
  });
}
/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 

}*/

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', () => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the FFV prompt');
      } else {
        console.log('User dismissed the ffv prompt');
      }
      deferredPrompt = null;
    });
  });
});

//cette ligne sert a attendre le chargement de la page html avent de lancé la ligne
window.addEventListener("load",demarrage);