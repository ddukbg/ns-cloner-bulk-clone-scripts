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
