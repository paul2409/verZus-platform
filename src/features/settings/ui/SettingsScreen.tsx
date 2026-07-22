import { Badge } from "@/components/primitives/badge";
import {
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

export function SettingsScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <OperationalActionLink href="/profile" variant="secondary">
            Back to profile
          </OperationalActionLink>
        }
        description="Open the authoritative owner for each account preference. Settings are not duplicated on this page."
        eyebrow="ACCOUNT CONTROL"
        status={<Badge tone="information">Single source of truth</Badge>}
        title="SETTINGS"
      />

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Display name, handle, bio, location, and connected game identities."
          eyebrow="Identity"
          title="Profile details"
          tone="cyan"
        >
          <SignalList>
            <SignalItem
              description="Changes are validated and version-checked before they become public."
              meta="PROFILE"
              title="Owned by Profile"
              tone="cyan"
            />
          </SignalList>
          <OperationalActionLink href="/profile/edit" variant="primary">
            Edit profile
          </OperationalActionLink>
        </OperationalPanel>

        <OperationalPanel
          description="Control which profile fields are visible to players, Crews, and the public."
          eyebrow="Privacy"
          title="Visibility controls"
          tone="green"
        >
          <SignalList>
            <SignalItem
              description="Permissions are enforced by the server when public profiles are projected."
              meta="PRIVACY"
              title="Owned by Profile privacy"
              tone="green"
            />
          </SignalList>
          <OperationalActionLink href="/profile/settings" variant="primary">
            Manage privacy
          </OperationalActionLink>
        </OperationalPanel>

        <OperationalPanel
          description="Competitive, Crew, reward, security, and platform notification channels."
          eyebrow="Notifications"
          title="Signal preferences"
          tone="magenta"
        >
          <SignalList>
            <SignalItem
              description="The notification domain owns both preferences and unread badge state."
              meta="NOTIFICATIONS"
              title="Owned by Notification settings"
              tone="magenta"
            />
          </SignalList>
          <OperationalActionLink href="/notifications/settings" variant="primary">
            Manage notifications
          </OperationalActionLink>
        </OperationalPanel>

        <OperationalPanel
          description="Use the verified recovery workflow to rotate a forgotten or compromised password."
          eyebrow="Security"
          title="Password recovery"
          tone="gold"
        >
          <SignalList>
            <SignalItem
              description="Recovery tokens are expiring, single-use, and delivered to the verified email address."
              meta="AUTH"
              title="Owned by Authentication"
              tone="gold"
            />
          </SignalList>
          <OperationalActionLink href="/forgot-password" variant="secondary">
            Start password recovery
          </OperationalActionLink>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
