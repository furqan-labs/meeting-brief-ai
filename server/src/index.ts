import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Meeting Brief AI server running on http://localhost:${PORT}`);
});
