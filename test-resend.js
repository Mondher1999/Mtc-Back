// test.js

// This is an async function wrapper to allow the use of 'await'.
async function sendTestEmail() {
  console.log("Attempting to send a test email...");
  try {
    // ✅ Dynamically import the Resend library, as it's an ES Module.
    const { Resend } = await import('resend');

    // ✅ Instantiate Resend *inside* the async function after importing it.
    const resend = new Resend('re_PZxwGnRb_PGWRgdkTXK1dm3YXtf7rAqes');

    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: ['mondher.1858@gmail.com'], // Use an email you can check
      subject: 'Simple Resend Test (from CJS)',
      html: '<strong>If you see this, the dynamic import is working.</strong>',
    });

    if (error) {
      console.error('--- RESEND RETURNED AN ERROR ---');
      console.error(error); // Log the full error object from Resend
      return;
    }

    console.log('--- SUCCESS! ---');
    console.log(data);

  } catch (exception) {
    console.error('--- THE CODE CRASHED ---');
    console.error(exception); // Log the full exception object
  }
}

// Call the function to run the test.
sendTestEmail();
