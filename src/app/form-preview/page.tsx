import { Button, ButtonGroup } from "@/components/primitives/button";
import {
  Checkbox,
  FormField,
  Input,
  PasswordInput,
  Radio,
  RadioGroup,
  SearchInput,
  Select,
  Switch,
  Textarea,
} from "@/components/primitives/forms";

import styles from "./page.module.css";

export default function FormPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Form-Control System</p>

          <h1 aria-label="Operational form controls" className="vz-display-xl">
            Operational
            <br aria-hidden="true" />
            form controls
          </h1>

          <p className="vz-body-md">
            Accessible, responsive controls for authentication, profile setup, competition entry,
            match reporting, search, filters, and platform preferences.
          </p>
        </header>

        <section aria-labelledby="text-controls" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="text-controls">
              Text controls
            </h2>

            <p className="vz-caption">Default / search / password</p>
          </div>

          <div className={styles.fieldGrid}>
            <FormField hint="This is visible on leaderboards." label="Player username" required>
              <Input autoComplete="username" placeholder="Enter your username" />
            </FormField>

            <FormField hideLabel label="Search players">
              <SearchInput placeholder="Search players, crews..." />
            </FormField>

            <FormField hint="Use at least 12 characters." label="Password" required>
              <PasswordInput autoComplete="new-password" placeholder="Enter a secure password" />
            </FormField>

            <FormField label="Player ID" optionalLabel="System managed">
              <Input readOnly value="VZ-JF-2048" />
            </FormField>
          </div>
        </section>

        <section aria-labelledby="selection-controls" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="selection-controls">
              Selection controls
            </h2>

            <p className="vz-caption">Select and radio groups</p>
          </div>

          <div className={styles.fieldGrid}>
            <FormField hint="Used to personalise competitions." label="Primary game" required>
              <Select defaultValue="ea-fc">
                <option value="ea-fc">EA FC</option>
                <option value="cod">Call of Duty</option>
                <option value="clash">Clash Royale</option>
                <option value="league">League of Legends</option>
              </Select>
            </FormField>

            <FormField label="Competitive region" required>
              <Select defaultValue="lagos">
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
                <option value="uk">United Kingdom</option>
              </Select>
            </FormField>
          </div>

          <RadioGroup
            hint="This controls your default competitive queue."
            label="Preferred competition format"
            orientation="horizontal"
            required
          >
            <Radio defaultChecked label="1v1" value="one-v-one" />

            <Radio label="Crew" value="crew" />

            <Radio label="Tournament" value="tournament" />
          </RadioGroup>
        </section>

        <section aria-labelledby="multiline-control" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="multiline-control">
              Multiline input
            </h2>

            <p className="vz-caption">Reports and supporting context</p>
          </div>

          <FormField
            hint="Do not include passwords or payment information."
            label="Match report"
            optionalLabel="Optional"
          >
            <Textarea
              maxLength={1000}
              placeholder="Describe what happened during the match..."
              rows={6}
            />
          </FormField>
        </section>

        <section aria-labelledby="choice-controls" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="choice-controls">
              Choice controls
            </h2>

            <p className="vz-caption">Checkbox and switches</p>
          </div>

          <div className={styles.choiceGrid}>
            <Checkbox
              defaultChecked
              description="Required before entering a competition."
              label="I accept the competition rules"
            />

            <Checkbox
              description="Only selects the players currently displayed."
              indeterminate
              label="Select visible players"
            />

            <Switch
              defaultChecked
              description="Notify me before check-in closes."
              label="Match reminders"
            />

            <Switch
              description="Show online status to players and crews."
              label="Presence visibility"
            />
          </div>
        </section>

        <section aria-labelledby="control-states" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="control-states">
              Operational states
            </h2>

            <p className="vz-caption">Invalid and disabled</p>
          </div>

          <div className={styles.fieldGrid}>
            <FormField error="This username is already in use." label="Unavailable username">
              <Input defaultValue="JAYFLEX" leadingIcon="user" />
            </FormField>

            <FormField disabled hint="Available after account verification." label="Crew code">
              <Input leadingIcon="users" placeholder="Locked" />
            </FormField>
          </div>
        </section>

        <section aria-labelledby="form-actions" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="form-actions">
              Form actions
            </h2>

            <p className="vz-caption">Safe primary and secondary paths</p>
          </div>

          <ButtonGroup label="Profile form actions" orientation="responsive">
            <Button leadingIcon="check">Save profile</Button>

            <Button leadingIcon="x" variant="ghost">
              Cancel
            </Button>
          </ButtonGroup>
        </section>
      </section>
    </main>
  );
}
