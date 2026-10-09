const fs = require("fs");
const path = require("path");
const { defineConfig } = require("eslint/config");
const baseConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

const CAMINHOS = {
  tema: "@/constants/theme",
  paleta: ["@/theme", "@/theme/palette"],
  monitoramento: "@/lib/monitoramento",
  lib: "src/lib/**",
  telas: [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/features/**/*.{ts,tsx}",
  ],
  featuresDir: path.join(__dirname, "src", "features"),
};

const SDKS_NATIVOS = [
  "@intercom/intercom-react-native",
  "customerio-reactnative",
  "@sentry/react-native",
];
const SHIMS_DE_MONITORAMENTO = [
  "@/lib/sentry",
  "@/lib/sentry.native",
  "@/lib/sentry.web",
];
const PALETA_CRUA = ["lightColors", "darkColors", "PALETTES"];

const HEX_PATTERN = "#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})";
const RGB_PATTERN = "(rgb|rgba|hsl|hsla)[ \t]*[(]";

const NO_RAW_COLOR_MESSAGE = `Cores hardcoded (hex/rgb/hsl) são proibidas em telas e componentes. Use tokens de \`${CAMINHOS.tema}\` (colors.*). Se a cor não existir lá, adicione um token antes.`;
const NO_RAW_FONT_SIZE_MESSAGE = `fontSize hardcoded é proibido em telas e componentes. Use um token de \`${CAMINHOS.tema}\` (typography.*.fontSize). Se o tamanho não existir na escala, adicione um token antes.`;
const CAPTURA_DIRETA_MESSAGE = `Erro capturado passa por capturarErro de \`${CAMINHOS.monitoramento}\` (CLAUDE.md, Convenções).`;
const RAW_PALETTE_MESSAGE =
  "Paleta crua fora de src/theme. Use createStyles((colors) => ...) + useStyles, ou useThemeColors().";
const NATIVE_SDK_MESSAGE =
  "SDK nativo de terceiro entra pelo shim em src/lib (<sdk>.ts, .native.ts, .web.ts). Importe do shim, nunca do pacote (CLAUDE.md, Convenções).";
const MONITORAMENTO_MESSAGE = `Use \`${CAMINHOS.monitoramento}\`: é a única porta para o SDK de erros (CLAUDE.md, Convenções).`;

const capturaDiretaSelectors = [
  {
    selector:
      "MemberExpression[object.name='posthog'][property.name='captureException']",
    message: CAPTURA_DIRETA_MESSAGE,
  },
];

const colorSelectors = [
  {
    selector: `Literal[value=/${HEX_PATTERN}/]`,
    message: NO_RAW_COLOR_MESSAGE,
  },
  {
    selector: `Literal[value=/${RGB_PATTERN}/]`,
    message: NO_RAW_COLOR_MESSAGE,
  },
  {
    selector: `TemplateElement[value.raw=/${HEX_PATTERN}/]`,
    message: NO_RAW_COLOR_MESSAGE,
  },
  {
    selector: "Property[key.name='fontSize'][value.type='Literal']",
    message: NO_RAW_FONT_SIZE_MESSAGE,
  },
];

const rawPalettePaths = CAMINHOS.paleta.map((name) => ({
  name,
  importNames: PALETA_CRUA,
  message: RAW_PALETTE_MESSAGE,
}));

const nativeSdkPaths = SDKS_NATIVOS.map((name) => ({
  name,
  message: NATIVE_SDK_MESSAGE,
}));
const sentryShimPaths = SHIMS_DE_MONITORAMENTO.map((name) => ({
  name,
  message: MONITORAMENTO_MESSAGE,
}));
const foraDeLibPaths = [...nativeSdkPaths, ...sentryShimPaths];
const restrictedPaths = [...rawPalettePaths, ...foraDeLibPaths];

const features = fs.existsSync(CAMINHOS.featuresDir)
  ? fs
      .readdirSync(CAMINHOS.featuresDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const featureBoundaryBlocks = features.map((feature) => ({
  files: [`src/features/${feature}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "warn",
      {
        paths: restrictedPaths,
        patterns: [
          {
            group: ["@/features/*", `!@/features/${feature}`],
            message: `Feature "${feature}" não importa de outra feature. O que duas features precisam sobe para src/lib, src/components/ui ou src/data (CLAUDE.md, Fronteiras).`,
          },
        ],
      },
    ],
  },
}));

module.exports = defineConfig([
  baseConfig,
  { ignores: ["dist/*"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [CAMINHOS.lib],
    rules: {
      "no-restricted-syntax": ["error", ...capturaDiretaSelectors],
      "no-restricted-imports": ["error", { paths: foraDeLibPaths }],
    },
  },
  {
    files: CAMINHOS.telas,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...capturaDiretaSelectors,
        ...colorSelectors,
      ],
      "no-restricted-imports": ["error", { paths: restrictedPaths }],
      "react/no-unescaped-entities": "warn",
    },
  },
  ...featureBoundaryBlocks,
  prettierConfig,
]);
