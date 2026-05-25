<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bienvenue sur EduManager</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border:1px solid #e5ecf5;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px rgba(15,23,42,0.08);">
            <div style="padding:28px 32px;background:linear-gradient(135deg,#274b82,#3565a8);color:#ffffff;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;">Bienvenue sur EduManager</h1>
                <p style="margin:12px 0 0;font-size:15px;opacity:0.92;">Votre compte a bien été créé avec succès.</p>
            </div>

            <div style="padding:30px 32px;">
                <p style="margin:0 0 14px;font-size:16px;">Bonjour <strong>{{ $user->name }}</strong>,</p>
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#425168;">
                    Nous vous confirmons que votre compte sur la plateforme <strong>EduManager</strong> a été créé avec succès.
                </p>
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#425168;">
                    Adresse email : <strong>{{ $user->email }}</strong><br>
                    Rôle : <strong>{{ $roleName }}</strong>
                </p>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#425168;">
                    Vous pouvez maintenant vous connecter à l’application et commencer à utiliser les fonctionnalités disponibles.
                </p>

                <div style="padding:16px 18px;border-radius:14px;background:#f7faff;border:1px solid #dbe7f5;color:#5a6a84;font-size:14px;">
                    Ceci est un email automatique de bienvenue envoyé après l’inscription.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
