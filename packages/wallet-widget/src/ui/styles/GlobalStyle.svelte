<style>
:host {
  --gray-0: hsl(0, 0%, 93%);
  --gray-1: hsl(0, 0%, 73%);
  --gray-2: hsl(0, 0%, 64%);
  --gray-3: hsl(0, 0%, 54%);
  --gray-4: hsl(0, 0%, 38%);
  --gray-5: hsl(0, 0%, 26%);
  --gray-6: hsl(0, 0%, 17%);
  --gray-7: hsl(0, 0%, 12%);
  --gray-8: hsl(0, 0%, 9%);
  --gray-9: hsl(0, 0%, 6%);

  --success: #b0ee5f;
  --danger: hsl(338, 100%, 50%);

  --background-color: var(--gray-9);
  --color: var(--gray-0);
  --font-family: "Visby CF", sans-serif;

  --modal-backdrop-color: rgba(0, 0, 0, 0.75);
  --modal-border-color: var(--gray-7);
  --modal-border-radius: 24px;
  --modal-box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.4);
}

:global(*) {
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

:global(button) {
  all: unset;
  cursor: pointer;
  text-align: center;
}

:global(label) {
  display: block;
  color: var(--gray-1);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

:global(input),
:global(.input) {
  display: block;
  background: var(--gray-7);
  border: 1px solid var(--gray-7);
  border-radius: 20px;
  color: var(--gray-0);
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  padding: 0 20px;
  width: 100%;
  height: 72px;
}

:global(input:hover),
:global(.input:hover) {
  border-color: var(--gray-5);
}

:global(input:focus),
:global(.input:focus) {
  outline: none;
  border-color: var(--gray-1);
}

:global(select) {
  appearance: none;
  background: transparent;
  cursor: pointer;
  border: 0;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  outline: 0;
}

:global(::placeholder) {
  color: var(--gray-5);
}

:global(path) {
  fill: currentColor;
}
</style>
