<style>
:global(main) {
  border: 1px solid var(--modal-border-color);
  border-radius: var(--modal-border-radius);
  box-shadow: var(--modal-box-shadow);

  background-color: var(--background-color);
  color: var(--color);
  font-family: var(--font-family);

  overflow: hidden;
}

:global(.scroll) {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

:global(.center) {
  display: grid;
  place-items: center;
}

:global(.footer) {
  flex: none;

  display: flex;

  background: var(--background-color);
  padding: 16px 20px;
}

/* typography */
:global(.success) {
  color: var(--success);
}

:global(.danger) {
  color: var(--danger);
}

:global(.underline) {
  text-decoration: underline;
}

/* buttons */
:global(.submit) {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--gray-0);
  border-radius: 23px;
  color: var(--gray-7);
  font-size: 16px;
  font-weight: 800;
  height: 46px;
}

:global(.submit:hover) {
  background-color: var(--gray-1);
}

:global(.submit:disabled) {
  background-color: var(--gray-5);
  color: var(--gray-9);
}

:global(.invert) {
  background-color: unset;
  border: 1px solid var(--gray-1);
  color: var(--gray-0);
}

:global(.invert:hover) {
  background-color: unset;
  color: var(--gray-1);
}

:global(.invert:disabled) {
  background-color: unset;
  border-color: var(--gray-5);
  color: var(--gray-5);
}
</style>
