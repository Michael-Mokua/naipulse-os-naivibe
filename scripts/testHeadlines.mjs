import 'dotenv/config';
import { fetchHeadlinesProduction } from '../src/productionDataFetchers.js';

(async () => {
  try {
    console.log('Fetching headlines...');
    const headlines = await fetchHeadlinesProduction();
    console.log('Headlines result:', JSON.stringify(headlines, null, 2));
  } catch (e) {
    console.error('Test failed:', e);
  }
})();
