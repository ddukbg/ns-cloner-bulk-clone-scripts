```markdown
# NS Cloner Batch Clone Script

A simple JavaScript snippet to batch-clone multiple WordPress multisite subdomains using the [NS Cloner](https://wordpress.org/plugins/ns-cloner-site-copier/) plugin’s AJAX endpoints.  
Ideal for free-version users who need to clone tens of sites in one go.

---

## Features

- Sequentially validates and initiates cloning for a configurable list of targets  
- Lightweight: runs in your browser console (no additional tools)  
- Easy to customize: define your own `targetName`/`targetTitle` pairs  
- Adjustable delay between requests to avoid server overload  

---

## Prerequisites

- WordPress Multisite with NS Cloner installed  
- Access to **Clone Site** screen in your Network Admin  
- A valid `clone_nonce` token (see below)  

---

## Installation

1. Create a new GitHub repository (e.g. `ns-cloner-batch-automator`) and push this script as `batch-clone.js`.  
2. Optionally, use a browser extension like [Tampermonkey](https://www.tampermonkey.net/) to load it as a snippet.  

---

## Configuration

1. **Define your targets**  
   Edit the `cloneConfig` array to list each site you want to clone:
   ```js
   const cloneConfig = [
     { name: 'at', title: 'My Web AT' },
     { name: 'be', title: 'My Web BE' },
     // add as many as you need...
   ];
   ```
   - `name`: the new site’s slug (subdomain)  
   - `title`: the new site’s title  

2. **Set your `clone_nonce`**  
   - Open Network Admin → **Clone Site** screen  
   - Open Developer Tools → Network tab  
   - Perform a **single manual** validate/init action  
   - Copy the `clone_nonce` value from the POST request payload
  ![image](https://github.com/user-attachments/assets/2cbd5f83-f6dd-45fd-b7bc-9ede6483a550)
   - Paste it into the script’s `cloneNonce` constant:  
     ```js
     const cloneNonce = 'YOUR_NONCE_HERE';
     ```  
   > **Note:** Nonce tokens expire (lifetime unknown). Generate a fresh one before running the batch.  

3. **Adjust delay (optional)**  
   The script waits 3 seconds between each clone by default. You can change:
   ```js
   await sleep(3000); // milliseconds
   ```  

---

## Usage

1. In your browser, navigate to **Network Admin → Clone Site** (where the “Create Target” form is visible).  
2. Open **Developer Tools → Console**.  
3. Paste the contents of `batch-clone.js` and hit Enter.  
4. Watch the console logs for success/failure per site.

---

## Sample Script (`batch-clone.js`)

```javascript
/**
 * Batch Clone Script for NS Cloner
 * ---------------------------------
 * Define your targets and nonce, then run in the browser console.
 */

(async () => {
  // 1. Core settings
  const sourceId   = '3';              // ID of the source site to clone
  const cloneMode  = 'core';           // NS Cloner mode
  const cloneNonce = 'f9cb79d3ef';     // Your NS Cloner nonce (copy from Network > POST)

  // 2. Targets: customize this list
  const cloneConfig = [
    { name: 'at', title: 'My Web AT' },
    { name: 'be', title: 'My Web BE' },
    { name: 'ch', title: 'My Web CH' },
    // ...add more entries as needed
  ];

  // 3. Simple sleep utility
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  // 4. Iterate and clone
  for (const { name: targetName, title: targetTitle } of cloneConfig) {
    console.log(`→ [${targetName}] Starting validation...`);

    // 4.1 Validate request
    const validateParams = new URLSearchParams({
      action: 'ns_cloner_validate_section',
      section_id: 'create_target',
      clone_mode: cloneMode,
      source_id: sourceId,
      target_title: targetTitle,
      target_name: targetName,
      clone_nonce: cloneNonce
    });
    let res = await fetch(
      '/wp-admin/admin-ajax.php?flag=ns_cloner_validate_section',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: validateParams
      }
    );
    let json = await res.json();
    if (!json.success) {
      console.error(`✖ [${targetName}] Validation failed`, json);
      await sleep(2000);
      continue;
    }
    console.log(`✔ [${targetName}] Validation passed`);

    // 4.2 Initiate clone
    console.log(`→ [${targetName}] Initiating clone...`);
    const initParams = new URLSearchParams({
      action: 'ns_cloner_process_init',
      clone_mode: cloneMode,
      source_id: sourceId,
      target_title: targetTitle,
      target_name: targetName,
      clone_nonce: cloneNonce
    });
    res = await fetch(
      '/wp-admin/admin-ajax.php?flag=ns_cloner_process_init',
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: initParams
      }
    );
    json = await res.json();
    if (json.success) {
      console.log(`✔ [${targetName}] Clone started`, json);
    } else {
      console.error(`✖ [${targetName}] Clone failed`, json);
    }

    // 4.3 Wait before next iteration
    await sleep(3000);
  }

  console.log('✅ Batch clone process complete!');
})();
```

---

## Troubleshooting

- **`clone_nonce` errors**: make sure you’re on the **Clone Site** page and using a fresh nonce from the Network tab.  
- **Timeouts or rate limits**: increase the sleep delay or split your list into smaller batches.  
- **Permission issues**: ensure your user has sufficient network-admin and database rights.

