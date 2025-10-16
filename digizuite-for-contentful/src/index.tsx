import { Asset, setup } from '@contentful/dam-app-base';

const CTA = 'Select asset from Digizuite';

type AssetMessage = {
    title: string;
    description: string;
    assetId: number;
    assetType: string;
    selectedQualityId: number;
    itemId: number;
    thumb: string;
    downloadUrl: string;
    sourceUrl: string;
    extension: string;
    lastModifiedTimeInMs: number;
}

function makeThumbnail(attachment: Asset): [string, string | undefined] {
  const url = attachment.thumb;
  const alt = attachment.title;

  return [url, alt];
}

function renderDialog(sdk: any) {
  // Either we have the model on invocation or instace.
  const config = sdk.parameters.invocation;
  let { digizuiteMmUrl } = config;
  if(!digizuiteMmUrl) {
    digizuiteMmUrl = sdk.parameters.instance.digizuiteMmUrl;
  }

  // Constructing URL and iframe to show on selection
  const container = document.createElement('div');
  const bf_embed_url = digizuiteMmUrl;

  const iframe = document.createElement('iframe');
  iframe.id = 'digizuite-embedded-view';
  iframe.className = 'iframe-container';
  iframe.src = bf_embed_url;
  iframe.width = "935";
  iframe.height = "650";
  iframe.style.border = 'none';
  container.appendChild(iframe);

  document.body.appendChild(container);

  sdk.window.startAutoResizer();

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) {
      return;
    }
	
    if(event?.data?.messageType === "AssetMessage") {
		var assetsToReturn: AssetMessage[] = [];
		
		var asset: AssetMessage = event.data.asset;
		if(asset) {
			assetsToReturn.push(asset);
		}
		
    if(event.data.assets && event.data.assets.length > 0) {
			assetsToReturn = event.data.assets;
    }
		
		if (assetsToReturn && assetsToReturn.length > 0) {
			sdk.close(assetsToReturn);
		}
	}

  });
}

async function openDialog(sdk: any, _currentValue: Asset[], config: any) {

  config.digizuiteMmUrl = sdk.parameters.instance.digizuiteMmUrl;

  const result = await sdk.dialogs.openCurrentApp({
    position: 'center',
    title: CTA,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    parameters: { ...config },
    width: 950,
    allowHeightOverflow: true,
  });

  if (!Array.isArray(result)) {
    return [];
  }

  return result;
}

setup({
  cta: CTA,
  name: 'Digizuite',
  logo: 'https://mango-tree-001f62003.1.azurestaticapps.net/assets/logo_256_px.png',
  color: '#40D1F5',
  description:
    'Digizuite is amazing.',
  parameterDefinitions: [
    {
      id: 'digizuiteMmUrl',
      type: 'Symbol',
      name: 'Digizuite MM URL',
      description:
        'Provide your media manager URL',
      default: "https://your-mm-url.com",
      required: true,
    },
  ],
  validateParameters: () => null,
  makeThumbnail,
  renderDialog,
  openDialog,
  isDisabled: () => false,
});
