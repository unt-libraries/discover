// Include static files in the manifest without bloating other packs,
// Doesn't need to be loaded in HTML to work
require.context('../images', true);
