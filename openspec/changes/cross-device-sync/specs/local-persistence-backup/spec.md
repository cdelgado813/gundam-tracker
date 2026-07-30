## ADDED Requirements

### Requirement: Sincronización cifrada opcional, nunca obligatoria
Si el usuario activa la sincronización entre dispositivos, la aplicación SHALL seguir guardando todos los datos localmente en primer lugar; la sincronización SHALL ser una copia adicional cifrada y opcional, nunca un requisito para usar la app.

#### Scenario: App sin sincronización activada
- **WHEN** el usuario nunca empareja ningún dispositivo
- **THEN** la aplicación funciona exactamente igual que hoy, con todos los datos solo en el dispositivo local

#### Scenario: Desactivar la sincronización
- **WHEN** el usuario desvincula todos sus dispositivos
- **THEN** sus datos siguen disponibles localmente sin ninguna pérdida
