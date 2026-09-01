<script lang="ts">
  // RequestTray — M4: the request selection state, one island per page.
  //
  // Owns everything interactive on the homepage / collection pages:
  //   • delegated .add-btn clicks on swatches (toggle code in/out of tray)
  //   • the nav tray button ([data-tray-open]) → slide-in drawer
  //   • localStorage persistence so selections survive navigation
  //   • quantity steppers + removal inside the drawer
  //
  // The drawer is position:fixed, so its DOM location is irrelevant; the
  // island renders a bare container + the drawer as siblings.
  //
  // Language stays per PRD §4: this is a *request tray* — no cart, no prices.
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'lamina.tray';
  const MAX_QTY = 99;

  interface TrayItem {
    code: string;
    name: string;
    qty: number;
  }

  let items = $state<TrayItem[]>([]);
  let open = $state(false);
  let opener: HTMLElement | null = null;
  let closeBtn: HTMLButtonElement | undefined;
  let trayEl: HTMLElement | undefined;

  const totalQty = $derived(items.reduce((n, i) => n + i.qty, 0));

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable (private mode) — session-only state is fine */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      items = parsed.filter(
        (i) =>
          i &&
          typeof i.code === 'string' &&
          typeof i.name === 'string' &&
          Number.isInteger(i.qty) &&
          i.qty >= 1 &&
          i.qty <= MAX_QTY,
      );
    } catch {
      /* corrupt storage — start empty */
    }
  }

  function isIn(code: string) {
    return items.some((i) => i.code === code);
  }

  /** Reflect tray state onto every .add-btn on the page. */
  function syncButtons() {
    document.querySelectorAll<HTMLElement>('.add-btn').forEach((btn) => {
      const code = btn.dataset.code;
      if (!code) return;
      const active = isIn(code);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', `${active ? 'Remove' : 'Add'} ${code} ${btn.dataset.name ?? ''} ${active ? 'from' : 'to'} the request`);
    });
  }

  function toggle(code: string, name: string) {
    const i = items.findIndex((it) => it.code === code);
    if (i >= 0) items.splice(i, 1);
    else items.push({ code, name, qty: 1 });
  }

  function setQty(code: string, delta: number) {
    const i = items.findIndex((it) => it.code === code);
    if (i < 0) return;
    items[i].qty = Math.min(MAX_QTY, Math.max(1, items[i].qty + delta));
  }

  function remove(code: string) {
    const i = items.findIndex((it) => it.code === code);
    if (i >= 0) items.splice(i, 1);
  }

  function clear() {
    items = [];
  }

  // --- drawer open/close ------------------------------------------------

  function openDrawer() {
    opener = document.activeElement as HTMLElement | null;
    open = true;
  }

  function closeDrawer() {
    open = false;
    opener?.focus();
    opener = null;
  }

  function onDocClick(e: MouseEvent) {
    const target = e.target as Element;
    // Swatch add buttons (delegated — buttons are rendered by Astro, the
    // island must not assume its own DOM contains them).
    const addBtn = target.closest<HTMLElement>('.add-btn');
    if (addBtn) {
      const code = addBtn.dataset.code;
      if (code) toggle(code, addBtn.dataset.name ?? code);
      return;
    }
    // Nav tray button + any element opting in (data-tray-open).
    if (target.closest('[data-tray-open]')) {
      openDrawer();
      return;
    }
    if (open && target.closest('[data-tray-close]')) closeDrawer();
  }

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') closeDrawer();
    // aria-modal dialogs must contain Tab — trap the cycle inside the
    // panel so focus can't escape to the page behind (PRD M5).
    if (e.key === 'Tab') trapFocus(e);
  }

  function trapFocus(e: KeyboardEvent) {
    if (!trayEl) return;
    const focusables = Array.from(
      trayEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    // A stray focus outside the panel (e.g. from a programmatic focus
    // while the drawer was opening) is pulled back in before cycling.
    if (!trayEl.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Overlay click (clicking the scrim, not the panel).
  function onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) closeDrawer();
  }

  onMount(() => {
    load();
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  });

  // Keep storage + button states in lockstep with items.
  $effect(() => {
    items;
    persist();
    if (typeof document !== 'undefined') syncButtons();
  });

  // Lock body scroll while the drawer is open.
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
      return () => {
        document.body.style.overflow = '';
      };
    }
  });
</script>

<!-- Container renders nothing; the drawer is fixed-positioned. -->
<span class="tray-host" aria-hidden="true"></span>

{#if open}
  <div class="tray-scrim" onclick={onOverlayClick}>
    <aside class="tray" role="dialog" aria-modal="true" aria-label="Request tray" bind:this={trayEl}>
      <header class="tray-head">
        <div class="tray-title">Request tray</div>
        <button
          class="tray-close"
          type="button"
          bind:this={closeBtn}
          onclick={closeDrawer}
          aria-label="Close request tray"
        >
          ✕
        </button>
      </header>

      {#if items.length === 0}
        <p class="tray-empty">
          Your request tray is empty. Add article numbers from the collections.
        </p>
      {:else}
        <ul class="tray-list">
          {#each items as item (item.code)}
            <li class="tray-row">
              <div class="tray-txt">
                <div class="tray-code">{item.code}</div>
                <div class="tray-name">{item.name}</div>
              </div>
              <div class="tray-actions">
                <div class="stepper">
                  <button
                    type="button"
                    class="step"
                    onclick={() => setQty(item.code, -1)}
                    aria-label={`Decrease quantity of ${item.code}`}
                  >
                    −
                  </button>
                  <span class="qty" aria-live="polite">{item.qty}</span>
                  <button
                    type="button"
                    class="step"
                    onclick={() => setQty(item.code, 1)}
                    aria-label={`Increase quantity of ${item.code}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  class="remove"
                  onclick={() => remove(item.code)}
                  aria-label={`Remove ${item.code} from the request`}
                >
                  Remove
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}

      <footer class="tray-foot">
        <div class="tray-total">
          {totalQty} {totalQty === 1 ? 'sample' : 'samples'} selected
        </div>
        <a class="tray-continue" href="/request" onclick={closeDrawer}>
          Continue with project details →
        </a>
        {#if items.length > 0}
          <button type="button" class="tray-clear" onclick={clear}>
            Clear tray
          </button>
        {/if}
      </footer>
    </aside>
  </div>
{/if}

<style>
  .tray-scrim {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: var(--scrim);
  }
  .tray {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 100vw);
    background: var(--paper);
    box-shadow: var(--tray-shadow);
    display: flex;
    flex-direction: column;
    animation: slide-in var(--dur-drawer) var(--ease-out);
  }
  @keyframes slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .tray-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px var(--gutter);
    border-bottom: var(--border);
  }
  .tray-title {
    font-family: var(--font-serif);
    font-size: var(--fs-tray-title);
  }
  .tray-close {
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--ash);
    padding: 6px;
    line-height: 1;
  }
  .tray-close:hover {
    color: var(--ink);
  }
  .tray-empty {
    padding: 32px var(--gutter);
    color: var(--ash);
    font-size: var(--fs-body);
  }
  .tray-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex: 1;
  }
  .tray-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 16px var(--gutter);
    border-bottom: 1px solid var(--line);
  }
  .tray-txt {
    line-height: 1.35;
    min-width: 0;
  }
  .tray-code {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    color: var(--ash);
    letter-spacing: var(--ls-mono);
  }
  .tray-name {
    font-size: var(--fs-label-lg);
    margin-top: 2px;
  }
  .tray-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    flex-shrink: 0;
  }
  .stepper {
    display: flex;
    align-items: center;
    border: var(--border);
    border-radius: var(--radius);
  }
  .step {
    width: 30px;
    height: 28px;
    border: none;
    background: none;
    font-size: 14px;
    cursor: pointer;
    color: var(--ink);
    font-family: inherit;
  }
  .step:hover {
    background: var(--stone-card);
  }
  .qty {
    min-width: 28px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
  }
  .remove {
    border: none;
    background: none;
    padding: 0;
    font-family: inherit;
    font-size: var(--fs-label);
    letter-spacing: var(--ls-eyebrow);
    text-transform: uppercase;
    color: var(--ash);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .remove:hover {
    color: var(--ember);
  }
  .tray-foot {
    padding: 20px var(--gutter);
    border-top: var(--border);
  }
  .tray-total {
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    color: var(--ash);
    letter-spacing: var(--ls-mono);
    margin-bottom: 14px;
  }
  .tray-continue {
    display: block;
    text-align: center;
    padding: 12px 16px;
    background: var(--ink);
    color: var(--stone);
    border-radius: var(--radius);
    font-family: var(--font-mono);
    font-size: var(--fs-label-btn);
    letter-spacing: var(--ls-mono-wide);
    text-transform: uppercase;
    text-decoration: none;
  }
  .tray-continue:hover {
    background: var(--ember);
  }
  .tray-clear {
    display: block;
    margin: 12px auto 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: var(--fs-label);
    letter-spacing: var(--ls-eyebrow);
    text-transform: uppercase;
    color: var(--ash);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .tray-clear:hover {
    color: var(--ink);
  }
  @media (max-width: 640px) {
    .tray-head,
    .tray-empty,
    .tray-row,
    .tray-foot {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
</style>
