# niivue-react :brain: :atom_symbol:

[![test](https://github.com/niivue/niivue-react/actions/workflows/test.yml/badge.svg)](https://github.com/niivue/niivue-react/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/niivue/niivue-react/branch/main/graph/badge.svg)](https://codecov.io/gh/niivue/niivue-react)
[![BSD License](https://img.shields.io/github/license/niivue/niivue-react)](https://github.com/niivue/niivue-react/blob/main/LICENSE)

`niivue-react` is a package which provides `<NiivueCanvas />`, a React component wrapper around `Niivue`
offering an immutable, declarative, React-friendly API.

For a real-world example, check out [FNNDSC's](https://fnndsc.org) "Fetal MRI atlas viewer." https://app.fetalmri.org/dataset

> [!NOTE]  
> Currently, 3D volumes and options are supported. Meshes are not yet supported, but we're 90% the way there!

## Installation

`niivue-react` is not yet available on NPM, so install it directly from GitHub:

```shell
npm install niivue/niivue-react
```

## Niivue v.s. `niivue-react`

Niivue's API is imperative. For example, let's consider some code which uses Niivue directly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>NiiVue</title>
</head>
<body>
<div>
  <label>
    Show Orient Cube
    <input type="checkbox" checked id="cube-checkbox" />
  </label>
  <label>
    Ventricles Opacity
    <input type="range" min="0.0" max="1.0" step="0.1" value="0.5" id="opacity-slider"/>
  </label>
</div>
<div>
  <canvas id="gl1"></canvas>
</div>
<script type="module" async>
  import { Niivue } from "@niivue/niivue";
  const opacitySlider = document.getElementById('opacity-slider');
  const cubeCheckbox = document.getElementById('cube-checkbox');
  const nv = new Niivue();
  nv.attachTo("gl1");
  const volumes = [
    {
      url: 'https://fetalmri-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/api/v1/files/23/template.nii.gz',
    },
    {
      url: 'https://fetalmri-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/api/v1/files/49/ventricles.nii.gz',
      opacity: opacitySlider.value,
      colormap: 'red'
    }
  ];
  await nv.loadVolumes(volumes);
  opacitySlider.oninput = function() {
    nv.setOpacity(1, opacitySlider.value);
  }
  cubeCheckbox.oninput = function () {
    nv.opts.isOrientCube = cubeCheckbox.checked;
    nv.updateGLVolume();
  }
  cubeCheckbox.oninput();
</script>
</body>
</html>
```

The translation to `niivue-react`'s usage looks like:

```tsx
import {NiivueCanvas, NVROptions, NVRVolume} from "niivue-react";

import {useImmer} from "use-immer";
import React from "react";

const ReadmeExample = () => {
  const [volumes, setVolumes] = useImmer<{[key: string]: NVRVolume}>({
    brain: {
      url: 'https://fetalmri-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/api/v1/files/23/template.nii.gz',
    },
    ventricle: {
      url: 'https://fetalmri-hosting-of-medical-image-analysis-platform-dcb83b.apps.shift.nerc.mghpcc.org/api/v1/files/49/ventricles.nii.gz',
      opacity: 0.5,
      colormap: 'red'
    }
  });
  const [options, setOptions] = useImmer<NVROptions>({
    isOrientCube: true
  });

  const setOpacity = (value: number) => {
    setVolumes((draft) => {
      draft.ventricle.opacity = value;
    });
  };

  const setOrientCube = (value: boolean) => {
    setOptions((draft) => {
      draft.isOrientCube = !value;
    });
  };
  
  const volumesList = React.useMemo(() => Object.values(volumes), [volumes]);

  return (<>
    <div>
      <label>
        Show Orient Cube
        <input
          type="checkbox"
          onChange={(e) => setOrientCube(!e.target.checked)}
          checked={options.isOrientCube}
        />
      </label>
      <label>
        Ventricles Opacity
        <input
          type="range" min="0.0" max="1.0" step="0.1"
          onChange={(e) => setOpacity(e.target.value)}
          value={volumes.ventricle.opacity}
        />
      </label>
    </div>
    <div>
      <NiivueCanvas
        options={options}
        volumes={React.useMemo(() => Object.values(volumes), [volumes])}
      />
    </div>
  </>);
}
```

Using `niivue-react`, state variables are consolidated as immutable objects.
Changing state is done using React hooks
([`useImmer`](https://immerjs.github.io/immer/example-setstate/) is a wrapper
around [`React.useState`](https://react.dev/learn/adding-interactivity#state-a-components-memory))
instead of manually calling Niivue's myriad of methods such as `await nv.loadVolumes`,
`nv.setOpacity`, `nv.opts.*`, and `nv.updateGLVolume`.

Furthermore, `niivue-react`'s API is designed to avoid using identifiers whereas
Niivue uses a mix of array index numbers and string IDs (which get confused easily).
For example, in Niivue you could call `nv.setOpacity(i, 0.5)` where `i` is the array
index of the volume you want to change. In the example above using `<NiivueCanvas />`
all we do is set `ventricle.opacity = 0.5` where `ventricle` is the volume we want to change.

## Another Example, Please

Please checkout [ModulateScalar.tsx](examples/demos/ModulateScalar.tsx), which is a rewrite of
[Niivue's modulateScalar.html](https://github.com/niivue/niivue/blob/main/demos/features/modulateScalar.html).

## Development

See [DEVELOP.md](./DEVELOP.md)
