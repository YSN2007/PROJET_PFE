<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS get_stagiaire_average');

        DB::unprepared(
            '
            CREATE PROCEDURE get_stagiaire_average(IN p_stagiaire_id BIGINT)
            BEGIN
                SELECT
                    s.id AS stagiaire_id,
                    CONCAT(COALESCE(s.nom, ""), " ", COALESCE(s.prenom, "")) AS stagiaire_name,
                    ROUND(AVG(n.note), 2) AS moyenne_generale,
                    COUNT(n.id) AS total_notes
                FROM stagiaires s
                LEFT JOIN notes n ON n.stagiaire_id = s.id
                WHERE s.id = p_stagiaire_id
                GROUP BY s.id, s.nom, s.prenom;
            END
            '
        );
    }

    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS get_stagiaire_average');
    }
};
