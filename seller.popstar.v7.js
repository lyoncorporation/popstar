
// Popstar seller dashboard script (externalized to avoid CSP inline-script blocks)
window.__POPSTAR_SELLER_BOOT = { ts: Date.now(), href: location.href };
(function(){
  try{
    const supabaseUrl = document.querySelector('meta[name="popstar-supabase-url"]')?.content;
    const supabaseAnonKey = document.querySelector('meta[name="popstar-supabase-anon-key"]')?.content;

    if (!supabaseUrl || !supabaseAnonKey){
      const err = document.getElementById('errMsg');
      if (err){
        err.textContent = 'missing supabase config meta tags.';
        err.style.display = 'block';
      }
      return;
    }

    // expose for debugging
    window.__POPSTAR_SUPABASE_URL = supabaseUrl;

    // Inject config values into the existing script by providing globals it expects.
    window.__POPSTAR_SUPABASE_URL_OVERRIDE = supabaseUrl;
    window.__POPSTAR_SUPABASE_ANON_KEY_OVERRIDE = supabaseAnonKey;
  }catch(e){}
})();


    (async function() {

      // If the Supabase CDN fails to load, nothing else will work (save/counter/etc).
      // Show a visible error instead of silently breaking.
      window.addEventListener('error', (ev) => {
        try{
          const errMsg = document.getElementById('errMsg');
          if (errMsg && ev?.message){
            errMsg.textContent = ev.message;
            errMsg.style.display = 'block';
          }
        }catch(e){}
      });

      async function waitForSupabase(){
        const start = Date.now();
        while (Date.now() - start < 5000){
          if (window.supabase && typeof window.supabase.createClient === 'function') return true;
          await new Promise(r=>setTimeout(r, 50));
        }
        return false;
      }

      const __ok = await waitForSupabase();
      if (!__ok){
        const errMsg = document.getElementById('errMsg');
        if (errMsg){
          errMsg.textContent = 'supabase failed to load (cdn blocked). check adblock / CSP.';
          errMsg.style.display = 'block';
        }
        const who = document.getElementById('whoami');
        if (who) who.textContent = 'not connected';
        return;
      }
const SUPABASE_URL = 'https://otvznctmwutbwulbhfvx.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90dnpuY3Rtd3V0Ynd1bGJoZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzc3MzcsImV4cCI6MjA4NzY1MzczN30.txShYO4rqLSMHeLuN_2rzRmvXZK3mnPsaabFtTa8Ph8';
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      
      window.__POPSTAR_SELLER_SB = sb;
const who = document.getElementById('whoami');
      const okMsg = document.getElementById('okMsg');
      const errMsg = document.getElementById('errMsg');
      const saveBtn = document.getElementById('saveBtn');

      

      

      const authPanel = document.getElementById('authPanel');
      const authEmail = document.getElementById('authEmail');
      const authSend = document.getElementById('authSend');
      const authStatus = document.getElementById('authStatus');

      function setAuthStatus(msg){
        if (!authStatus) return;
        authStatus.textContent = msg || '';
      }
let okTimer = null;
      const els = {
        shop_name: document.getElementById('shop_name'),
        handle: document.getElementById('handle'),
        city: document.getElementById('city'),
        state: document.getElementById('state'),
        bio: document.getElementById('bio'),
      };

      

      const bioCountEl = document.getElementById('bioCount');

      

      const mediaEls = {
        profile: { input: document.getElementById('file_profile'), prev: document.getElementById('prev_profile'), status: document.getElementById('status_profile') },
        item1: { input: document.getElementById('file_item1'), prev: document.getElementById('prev_item1'), status: document.getElementById('status_item1') },
        item2: { input: document.getElementById('file_item2'), prev: document.getElementById('prev_item2'), status: document.getElementById('status_item2') },
        item3: { input: document.getElementById('file_item3'), prev: document.getElementById('prev_item3'), status: document.getElementById('status_item3') },
      };

      // Stored in memory; persisted to sellers row on Save (if those columns exist)
      const MEDIA = { profile: null, item1: null, item2: null, item3: null };

      function setMediaStatus(key, msg){
        const el = mediaEls[key]?.status;
        if (!el) return;
        el.textContent = msg || '';
      }

      function setPreview(key, url){
        const img = mediaEls[key]?.prev;
        if (!img) return;
        if (!url){
          img.removeAttribute('src');
          img.style.display = 'none';
          return;
        }
        img.src = url;
        img.style.display = 'block';
      }

      function fileExt(name){
        const s = String(name || '');
        const i = s.lastIndexOf('.');
        if (i === -1) return '';
        return s.slice(i).toLowerCase();
      }

      async function uploadToBucket(bucket, file, path){
        const { error } = await sb.storage.from(bucket).upload(path, file, {
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });
        if (error) throw error;
        const { data } = sb.storage.from(bucket).getPublicUrl(path);
        return { url: data?.publicUrl || null, path };
      }

      async function handleUpload(kind, user){
        const input = mediaEls[kind]?.input;
        if (!input || !input.files || !input.files[0]) return;

        const file = input.files[0];
        const ext = fileExt(file.name) || '.jpg';

        const bucket = (kind === 'profile') ? 'avatars' : 'items';
        const path = (kind === 'profile')
          ? `${user.id}/profile${ext}`
          : `${user.id}/${kind}${ext}`;

        setMediaStatus(kind, 'uploading…');

        try{
          const res = await uploadToBucket(bucket, file, path);
          MEDIA[kind] = res.url || null;

          if (res.url){
            setPreview(kind, res.url);
            setMediaStatus(kind, 'uploaded.');
          }else{
            setMediaStatus(kind, `uploaded to ${bucket}. make bucket public to preview.`);
          }
        }catch(e){
          // NOTE: Supabase often returns "Bucket not found" when policies deny access.
          setMediaStatus(kind, e?.message || 'upload failed.');
        }finally{
          try{ input.value = ''; }catch(e){}
        }
      }

function updateBioCount(){
        if (!bioCountEl || !els.bio) return;
        const len = (els.bio.value || '').length;
        bioCountEl.textContent = len + ' / 160';
      }
// Track how we matched the seller row (if any)
      const MATCH = { col: null, val: null, row: null };

      const COLS = 'id, shop_name, depop_handle, city, state, bio, profile_image_url, item_image_1_url, item_image_2_url, item_image_3_url, profile_url, item1_url, item2_url, item3_url';

      function showOk(msg) {
        okMsg.textContent = msg || 'saved.';
        okMsg.style.display = "block";
        errMsg.style.display = "none";

        if (okTimer) clearTimeout(okTimer);
        okTimer = setTimeout(() => { okMsg.style.display = "none"; }, 2000);
errMsg.style.display = 'none';
      }
      function showErr(msg) {
        errMsg.textContent = msg || 'something went wrong.';
        errMsg.style.display = 'block';
        okMsg.style.display = 'none';
      }

      function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

      
      async function requireSession() {
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;

        const loginLink = document.getElementById('loginLink');

        if (!data.session) {
          // No session: keep the page usable but disable save/uploads.
          if (who) who.textContent = 'not logged in';
          if (loginLink) loginLink.style.display = 'none';
        if (authPanel) authPanel.style.display = 'none';
          if (authPanel) authPanel.style.display = 'block';
          showErr('please log in to edit your profile.');

          try{
            saveBtn.disabled = true;
            saveBtn.textContent = 'log in first';
          }catch(e){}

          return null;
        }

        if (loginLink) loginLink.style.display = 'none';
        try{
          saveBtn.disabled = false;
          saveBtn.textContent = 'save';
        }catch(e){}
        return data.session;
      }


      function normalizeHandle(v){
        const s = String(v || '').trim();
        if (!s) return null;
        return s.startsWith('@') ? s : ('@' + s);
      }

      function stripUnknownColumnFromPayload(message, payload){
        // Handles common Supabase/Postgres errors:
        // - column "email" of relation "sellers" does not exist
        // - Could not find the 'handle' column of 'sellers' in the schema cache
        const msg = String(message || '');
        let m = msg.match(/column\s+\"([^\"]+)\"\s+of\s+relation/i);
        if (!m) m = msg.match(/Could not find the '([^']+)' column/i);
        if (!m) return null;

        const col = m[1];
        if (!col || !(col in payload)) return null;

        const next = Object.assign({}, payload);
        delete next[col];
        return next;
      }

      async function tryMaybeSingle(col, val){
        const { data, error } = await sb.from('sellers').select(COLS).eq(col, val).maybeSingle();
        if (error) throw error;
        return data || null;
      }

      async function resolveSellerRow(user){
        // Step 1 goal: make mapping robust WITHOUT changing your database.
        // We try a small list of common patterns; if a column doesn't exist, we ignore and keep trying.

        const candidates = [
          { col: 'id', val: user.id, label: 'id == auth.uid' },
          { col: 'auth_user_id', val: user.id, label: 'auth_user_id == auth.uid' },
          { col: 'user_id', val: user.id, label: 'user_id == auth.uid' },
          ];

        for (const c of candidates){
          if (!c.val) continue;
          try{
            const row = await tryMaybeSingle(c.col, c.val);
            if (row){
              MATCH.col = c.col;
              MATCH.val = c.val;
              MATCH.row = row;
              return row;
            }
          }catch(e){
            // If the column doesn't exist, just try next candidate.
            const msg = String(e?.message || '');
            if (/column .* does not exist/i.test(msg) || /schema cache/i.test(msg)) continue;
            // Any other error (RLS, network, etc.) should surface.
            throw e;
          }
        }
        return null;
      }

      function applyRowToForm(row){
        els.shop_name.value = row?.shop_name || '';
        els.handle.value = row?.depop_handle || '';
        els.city.value = row?.city || '';
        els.state.value = row?.state || '';
        els.bio.value = row?.bio || '';
      
        
        // media (supports a few possible column names)
        const prof = row?.profile_image_url || row?.profile_url || null;
        const i1 = row?.item_image_1_url || row?.item1_url || null;
        const i2 = row?.item_image_2_url || row?.item2_url || null;
        const i3 = row?.item_image_3_url || row?.item3_url || null;

        MEDIA.profile = prof;
        MEDIA.item1 = i1;
        MEDIA.item2 = i2;
        MEDIA.item3 = i3;

        setPreview('profile', prof);
        setPreview('item1', i1);
        setPreview('item2', i2);
        setPreview('item3', i3);

        updateBioCount();
      }

      els.bio && els.bio.addEventListener('input', updateBioCount);

      // media uploads
      mediaEls.profile?.input?.addEventListener('change', async () => {
        const session = await sb.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user) return;
        await handleUpload('profile', user);
      });
      mediaEls.item1?.input?.addEventListener('change', async () => {
        const session = await sb.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user) return;
        await handleUpload('item1', user);
      });
      mediaEls.item2?.input?.addEventListener('change', async () => {
        const session = await sb.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user) return;
        await handleUpload('item2', user);
      });
      mediaEls.item3?.input?.addEventListener('change', async () => {
        const session = await sb.auth.getSession();
        const user = session?.data?.session?.user;
        if (!user) return;
        await handleUpload('item3', user);
      });

      async function loadProfile(session) {
        const user = session.user;
        who.textContent = 'logged in as: ' + (user.email || 'seller');

        const row = await resolveSellerRow(user);
        if (row){
          applyRowToForm(row);
          try{ console.log('[popstar seller] profile matched via', MATCH.col, MATCH.val); }catch(e){}
        }else{
          try{ console.log('[popstar seller] no sellers row found yet (will create on save)'); }catch(e){}
        }
      }

      
      async function updateExistingRow(payload){
        const matchCol = MATCH.col || 'id';
        const matchVal = MATCH.val || payload.id;

        let patch = {
          shop_name: payload.shop_name,
          depop_handle: payload.depop_handle,
          city: payload.city,
          state: payload.state,
          bio: payload.bio,

          profile_image_url: MEDIA.profile,
          item_image_1_url: MEDIA.item1,
          item_image_2_url: MEDIA.item2,
          item_image_3_url: MEDIA.item3,

          profile_url: MEDIA.profile,
          item1_url: MEDIA.item1,
          item2_url: MEDIA.item2,
          item3_url: MEDIA.item3,
        };

        for (let i=0; i<10; i++){
          const { error } = await sb.from('sellers').update(patch).eq(matchCol, matchVal);
          if (!error) return true;

          const msg = String(error?.message || '');
          const next = stripUnknownColumnFromPayload(msg, patch);
          if (next){
            patch = next;
            continue;
          }
          throw error;
        }

        throw new Error('could not update seller row (schema mismatch).');
      }

      async function insertNewRow(payload){
        // Insert with progressive stripping of unknown columns (if your schema differs).
        let attempt = Object.assign({}, payload);

        for (let i=0; i<6; i++){
          const { error } = await sb.from('sellers').insert(attempt);
          if (!error) return true;

          const msg = String(error?.message || '');
          if (/row-level security|permission denied|not allowed|violates row-level security/i.test(msg)){
            throw error;
          }

          const next = stripUnknownColumnFromPayload(msg, attempt);
          if (next){
            attempt = next;
            continue;
          }

          throw error;
        }

        throw new Error('could not insert seller row (schema mismatch).');
      }

      async function saveProfile(session) {
        const user = session.user;

        // Always resolve seller row by auth uid; we do NOT insert from the client.
        try{
          MATCH.col = null; MATCH.val = null; MATCH.row = null;
          await resolveSellerRow(user);
        }catch(e){}


        const payload = {
          id: user.id,
          shop_name: (els.shop_name.value || '').trim() || null,
          depop_handle: normalizeHandle(els.handle.value),
          city: (els.city.value || '').trim() || null,
          state: (els.state.value || '').trim() || null,
          bio: (els.bio.value || '').trim() || null,
          // optional; stripped automatically if your table doesn't have it
          email: user.email || null,
          auth_user_id: user.id,
          user_id: user.id,
        };

        saveBtn.disabled = true;
        saveBtn.textContent = 'saving…';

        try {
          if (MATCH.row) {
            await updateExistingRow(payload);
          } else {
            throw new Error('no seller profile row found for this account yet. (sellers.id must equal auth.uid).');
          }

          showOk('saved.');
          await sleep(100);

          // refresh match + form values
          try{
            MATCH.col = null; MATCH.val = null; MATCH.row = null;
            const row = await resolveSellerRow(user);
            if (row) applyRowToForm(row);
          }catch(e){}
        } catch (e) {
          showErr(e?.message || 'could not save.');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'save';
        }
      }

      document.getElementById('logoutBtn').addEventListener('click', async () => {
        await sb.auth.signOut();
        window.location.href = 'seller-login.html';
      });

      window.__POPSTAR_SAVE_BOUND = true;
      saveBtn.addEventListener('click', async () => {
        try {
          const session = await requireSession();
          if (!session) return;
          await saveProfile(session);
        } catch (e) {
          showErr(e?.message || 'could not save.');
        }
      });


      authSend && authSend.addEventListener('click', async () => {
        const email = (authEmail?.value || '').trim();
        if (!email){
          setAuthStatus('enter your email.');
          return;
        }
        setAuthStatus('sending…');
        try{
          const { error } = await sb.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin + '/seller.html' }
          });
          if (error) throw error;
          setAuthStatus('sent. check your email for the link.');
        }catch(e){
          setAuthStatus(e?.message || 'could not send link.');
        }
      });

      (async function init() {
        try {
        // If you arrive here via magic link PKCE flow, Supabase may append ?code=... in the URL.
        // We must exchange it for a session, otherwise getSession() stays null.
        try{
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
          if (code && sb?.auth?.exchangeCodeForSession){
            const { error } = await sb.auth.exchangeCodeForSession(window.location.href);
            if (error) throw error;

            // Clean the URL (remove code param) so refreshes don't re-run exchange.
            url.searchParams.delete('code');
            const qs = url.searchParams.toString();
            window.history.replaceState({}, document.title, url.pathname + (qs ? ('?' + qs) : '') + url.hash);
          }
        }catch(e){
          showErr(e?.message || 'could not complete login. try requesting a new login link.');
        }


          const session = await requireSession();
          if (!session) return;
          await loadProfile(session);
        
          updateBioCount();
} catch (e) {
          showErr(e?.message || 'could not load.');
        }
      })();
    })();
  