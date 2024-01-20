import { test as base } from "@playwright/test";
import {NVImage} from "@niivue/niivue";
import {NVRVolume} from "../../src";

type NiivueCanvasTest = {
  getVolume: (name: string) => Promise<NVImage>;
  setVolumes: (volumes: NVRVolume[]) => Promise<void>;
}

type MyFixtures = {
  nvt: NiivueCanvasTest
}

export const test = base.extend<MyFixtures>({
  nvt: async ({ page }, use) => {
    const setVolumes = async (volumes: NVRVolume[]) => {
      await page.getByTestId("volumes-string").fill(JSON.stringify(volumes));
      await page.getByTestId("set-volumes").click();
    };
    const getVolume = async (name: string): Promise<NVImage> => {
      const text = await page.getByTestId(`nv-volume-${name}`).innerText();
      return JSON.parse(text);
    };
    await page.goto('http://localhost:5173/playwright_harness');
    await use({setVolumes, getVolume});
  }
});

export { expect } from '@playwright/test';
