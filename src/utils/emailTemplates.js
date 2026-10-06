export const DigiHealthVerificationEmail = {
    subject: 'Verify your DigiHealth account',
    text: `Hello,

Welcome to DigiHealth.

Please verify your email address to complete your registration and activate your account.

Verify Email: {{ACTION_URL}}

If you did not create this account, you can safely ignore this email.

Thanks,
DigiHealth Team
UNZA Healthcare Portal`,
    html: `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="height:6px;background:linear-gradient(90deg,#d91f26 0%,#f59e0b 50%,#1f8a4c 100%);"></div>

        <div style="padding:32px 32px 20px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <div style="width:54px;height:54px;border-radius:14px;border:1px solid #dbeafe;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(15,23,42,0.06);">
              <img src="https://your-domain.com/images/uzamainlogo.png" alt="UNZA logo" style="width:38px;height:38px;object-fit:contain;display:block;" />
            </div>
            <div>
              <div style="font-size:12px;letter-spacing:2px;color:#0369a1;text-transform:uppercase;font-weight:700;">UNZA Healthcare</div>
              <div style="font-size:28px;line-height:1.1;font-weight:800;color:#0f172a;">DigiHealth</div>
            </div>
          </div>

          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.2;color:#0f172a;">Verify your email</h1>

          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">
            Hello,<br /><br />
            Welcome to DigiHealth. To complete your account setup and secure your access to the clinic portal,
            please verify your email address.
          </p>

          <div style="margin:24px 0;text-align:center;">
            <a href="{{ACTION_URL}}" style="display:inline-block;padding:16px 28px;border-radius:12px;background:#0284c7;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;box-shadow:0 10px 24px rgba(2,132,199,0.25);">
              Verify Email
            </a>
          </div>

          <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#475569;">
            If the button does not work, copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 20px;word-break:break-all;font-size:13px;line-height:1.7;color:#0369a1;">{{ACTION_URL}}</p>

          <div style="padding:18px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#475569;font-size:14px;line-height:1.7;">
            If you did not create this account, you can safely ignore this email.
          </div>
        </div>

        <div style="padding:24px 32px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <div style="font-size:12px;letter-spacing:1.5px;color:#64748b;text-transform:uppercase;font-weight:700;margin-bottom:8px;">
            DigiHealth Team
          </div>
          <div style="font-size:13px;color:#475569;line-height:1.7;">
            UNZA Clinic Management Portal<br />
            Secure access for students, staff, and clinical teams
          </div>
        </div>
      </div>
    </div>
  `
}
