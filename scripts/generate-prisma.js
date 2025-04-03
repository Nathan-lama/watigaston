const { exec } = require('child_process');

console.log('Running Prisma generate...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Prisma client generated successfully!');
});
