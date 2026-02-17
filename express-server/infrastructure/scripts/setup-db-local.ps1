param(
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres",
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [ValidateSet("local", "docker")]
    [string]$NameSet = "local"
)

$ErrorActionPreference = "Stop"

$localDbNames = @(
    "workflow_auth",
    "workflow_user",
    "workflow_permission",
    "workflow_workflow_def",
    "workflow_workflow_inst",
    "workflow_task",
    "workflow_approval",
    "workflow_document",
    "workflow_audit",
    "workflow_notification",
    "workflow_reporting"
)

$dockerDbNames = @(
    "auth_db",
    "user_db",
    "permission_db",
    "workflow_def_db",
    "workflow_inst_db",
    "task_db",
    "approval_db",
    "document_db",
    "audit_db",
    "notification_db",
    "reporting_db"
)

$dbNames = if ($NameSet -eq "docker") { $dockerDbNames } else { $localDbNames }

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql is not available in PATH. Install PostgreSQL client tools and reopen terminal."
}

$env:PGPASSWORD = $DbPassword

Write-Host "Creating databases using '$NameSet' naming set on $Host:$Port with user '$DbUser'..." -ForegroundColor Cyan

foreach ($dbName in $dbNames) {
    $sql = "SELECT 'CREATE DATABASE $dbName' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\gexec"
    psql -h $Host -p $Port -U $DbUser -d postgres -v ON_ERROR_STOP=1 -c $sql | Out-Null
    Write-Host "- ensured $dbName" -ForegroundColor Green
}

Write-Host "Done. Database setup completed." -ForegroundColor Green
