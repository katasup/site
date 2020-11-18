# Нативные ES6 Modules в браузере

С момента, когда зарелизись ES модули прошло не так мало времени и они уже [поддерживаются](https://caniuse.com/es6-module) во всех современных браузерах. Тут я рассмотрю как ими пользоваться, что они из себя представляют и какие с ними могут быть связаны проблемы.

Простой пример как загрузить зависимость:

```javascript
// random.js
function randomInRange(from, to) {
  return Math.floor(Math.random() * (to - from) + from);
}

export randomInRange;
```

```html
<!-- index.html -->
<script type="module">
  import { randomInRange } from './random.js';

  const randomNumber = randomInRange(100, 200);

  console.log(randomNumber);
</script>
```

При встраивании скрипта нужно указать что это модуль `type="module"` и добавить путь на фоллбэк для браузеров, которые не поддерживают модули. Все скрипты с аттрибутом `nomodule` будут игнорироваться современными браузерами.

```html
<script type="module" src="app.js"></script>
<script nomodule src="fallback.js"></script>
```

Скрипты с типом `module` по умолчанию грузятся в фоне параллельно документу и выполняются когда `DOM` дерево будет построено, они ведут себя так же, как если бы у них было установлено [свойство `defer`](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer).

Если нет необходимости загружать все ресурсы сразу, можно отложить загрузку до востребования динамическим импортом `import()`:

```html
<script type="module">
  const main = document.querySelectorAll('.main');
  const links = document.querySelectorAll('a.route');

  links.forEach(link => link.addEventListener('click', handleClick);

  async function handleClick(event) {
    if (!event.dataset.route) {
      return true;
    }

    event.preventDefault();

    try {
      main.textContent = await import(`/views/${event.dataset.route}.js`);
    } catch (e) {
      main.textContent = error.message;
    }
  }
</script>
...
```

ES модули могут быть загружены только по относительному или абсолютному пути, bare-импорты `import _ from 'lodash'` не поддерживаются. При возникновении такой ситуации

```html
<script type="module">
  import { randomInRange } from 'random.js';

  const randomNumber = randomInRange(100, 200);

  console.log(randomNumber);
</script>
```

Браузер любезно сообщит:

> Uncaught TypeError: Failed to resolve module specifier "random.js". Relative references must start with either "/", "./", or "../".

Такие зависимости можно загружать с помощью [SystemJS](https://github.com/systemjs/systemjs) непосредственно с unpgk.com или бандлить в отдельные модули.

### Когда использовать ES модули?

ЕS модули могут стать [большой проблемой производительности](https://docs.google.com/document/d/1ovo4PurT_1K4WFwN2MYmmgbLcr7v6DRQN67ESVA-wq0/pub){ rel="noopener noreferrer" target="_blank" } при разработки больших приложений поэтому стоит обратить большое внимание на количество модулей и глубину дерева зависимостей в приложении.

Так как статические импорты позволяют не только разбивать код на модули, но так же открывают возможность анализировать дерево зависимостей и при помощи tree-shaking избавляться от неиспользуемого кода.

Итак ES модули стоит использовать для небольших приложений, когда не критично время холодной загрузки, однако важно что бы постоянные пользователи с прогретым кэшем получали весь обновленный код максимально быстро. Например, небольшое изменение кода в собранном в бандл приложении может привести к тому что пользователи будут загружать все приложение заново.
