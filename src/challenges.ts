export type Challenge = {
  id: number;
  patternCategory: "Creational" | "Structural" | "Behavioral";
  title: string;
  scenario: string;
  badCode: string;
  question: string;
  options: { id: string; label: string; code?: string }[];
  correctOptionId: string;
  explanation: string;
};

export const challenges: Challenge[] = [
  {
    id: 1,
    patternCategory: "Creational",
    title: "Factory Method",
    scenario:
      "Checkout supports Stripe, PayPal, and bank transfer. Every new payment provider means another branch in the code that decides which processor to construct.",
    badCode: `function processPayment(method: PaymentMethod, amount: number) {
  if (method === "stripe") {
    const processor = new StripeProcessor();
    processor.charge(amount);
  } else if (method === "paypal") {
    const processor = new PayPalProcessor();
    processor.charge(amount);
  } else if (method === "bank") {
    const processor = new BankTransferProcessor();
    processor.charge(amount);
  }
}`,
    question:
      "Which refactor removes the provider branches from checkout and lets a new provider plug in without changing the caller?",
    options: [
      {
        id: "a",
        label: "Give each provider its own Checkout subclass.",
        code: `abstract class Checkout {
  abstract pay(amount: number): void;
}

class StripeCheckout extends Checkout {
  pay(amount: number) {
    new StripeProcessor().charge(amount);
  }
}
// PayPalCheckout and BankCheckout repeat the same flow`,
      },
      {
        id: "b",
        label: "Move the branches into a single universal processor.",
        code: `class UniversalProcessor {
  charge(method: PaymentMethod, amount: number) {
    if (method === "stripe") { /* Stripe call */ }
    else if (method === "paypal") { /* PayPal call */ }
    else { /* bank call */ }
  }
}`,
      },
      {
        id: "c",
        label:
          "Introduce a PaymentProcessor interface and a factory that returns the right processor.",
        code: `interface PaymentProcessor {
  charge(amount: number): void;
}
function createProcessor(method: PaymentMethod): PaymentProcessor {
  switch (method) {
    case "stripe": return new StripeProcessor();
    case "paypal": return new PayPalProcessor();
    case "bank": return new BankTransferProcessor();
  }
}`,
      },
    ],
    correctOptionId: "c",
    explanation:
      "A shared PaymentProcessor interface lets checkout depend on an abstraction, and the factory is the one place that knows the concrete providers. Adding a provider changes the factory only, not checkout or the payment workflow. The subclass option duplicates the checkout flow for every provider, while the universal processor simply relocates the same conditional into a larger class.",
  },
  {
    id: 2,
    patternCategory: "Creational",
    title: "Builder",
    scenario:
      "The Notification constructor now takes eight positional arguments, most of them optional. Call sites are hard to read, and invalid combinations such as SMS enabled without a phone number are easy to create.",
    badCode: `const notification = new Notification(
  customer.email,
  customer.phone,
  true,
  false,
  true,
  "order-confirmation",
  "high",
  undefined
);`,
    question:
      "Which refactor makes call sites readable and validates invalid combinations?",
    options: [
      {
        id: "a",
        label: "Add overloads for the common argument combinations.",
        code: `constructor(email: string, sms: true, phone: string);
constructor(email: string, push: true);
constructor(email: string, receipt: true);
constructor(email: string, template: string);
// more overloads, then one positional implementation`,
      },
      {
        id: "b",
        label:
          "Introduce a NotificationBuilder with chained methods and a validating build().",
        code: `const notification = new NotificationBuilder(customer.email)
  .withSms(customer.phone)
  .withReceipt()
  .withTemplate("order-confirmation")
  .withPriority("high")
  .build();

// build() throws when SMS has no phone or push has no device`,
      },
      {
        id: "c",
        label: "Replace the arguments with one options object.",
        code: `const notification = new Notification({
  email: customer.email,
  phone: customer.phone,
  sms: true,
  push: false,
  receipt: true,
  template: "order-confirmation",
  priority: "high",
});`,
      },
    ],
    correctOptionId: "b",
    explanation:
      "The builder gives every decision a name and puts validation in build(), so invalid combinations fail when the notification is constructed. An options object improves readability but does not centralize validation and still allows impossible combinations. Overloads multiply quickly and keep the positional arguments that made call sites unreadable.",
  },
  {
    id: 3,
    patternCategory: "Structural",
    title: "Adapter",
    scenario:
      "The SMS provider exposes sendText(phone, message, options), while the rest of the system is written against NotificationSender.send(notification). Checkout currently special-cases the vendor class.",
    badCode: `class SmsGateway {
  sendText(phone: string, msg: string, opts: { urgent?: boolean }) {
    // vendor SDK call
  }
}

function sendNotification(n: Notification) {
  if (n.channel === "sms") {
    new SmsGateway().sendText(n.phone, n.body, {
      urgent: n.priority === "high",
    });
  } else {
    emailSender.send(n);
  }
}`,
    question:
      "Which change lets SMS delivery follow the same NotificationSender contract without editing vendor code?",
    options: [
      {
        id: "a",
        label: "Add an SmsGatewayAdapter that implements NotificationSender.",
        code: `class SmsGatewayAdapter implements NotificationSender {
  constructor(private gateway: SmsGateway) {}

  send(notification: Notification) {
    this.gateway.sendText(notification.phone, notification.body, {
      urgent: notification.priority === "high",
    });
  }
}`,
      },
      {
        id: "b",
        label: "Change NotificationSender to match the vendor method signature.",
        code: `interface NotificationSender {
  send(phone: string, message: string, opts: { urgent?: boolean }): void;
}

class EmailSender implements NotificationSender {
  send(phone: string, message: string, opts: { urgent?: boolean }) {
    this.sendEmail(phone, message);
  }
}`,
      },
      {
        id: "c",
        label: "Make the vendor class implement NotificationSender.",
        code: `class SmsGateway implements NotificationSender {
  send(notification: Notification) {
    this.sendText(notification.phone, notification.body, {
      urgent: notification.priority === "high",
    });
  }
}`,
      },
    ],
    correctOptionId: "a",
    explanation:
      "The adapter implements our NotificationSender interface and translates one send(notification) call into the vendor's sendText(phone, message, options). This keeps both the vendor class and the domain interface unchanged. Changing the interface forces every sender into an SMS-shaped API, and editing the vendor class couples third-party code to our domain and may not survive an upgrade.",
  },
  {
    id: 4,
    patternCategory: "Structural",
    title: "Decorator",
    scenario:
      "Delivery features are added by subclassing: logging, retries, and encryption each create another combination. The class hierarchy is growing faster than the feature list.",
    badCode: `class RetryingSender extends BaseSender {
  send(n: Notification) { /* retry */ super.send(n); }
}

class EncryptedSender extends RetryingSender {
  send(n: Notification) { /* encrypt */ super.send(n); }
}

class LoggedRetryingEncryptedSender extends EncryptedSender {
  send(n: Notification) { this.log(n); super.send(n); }
}
// one more subclass per new combination`,
    question:
      "Which refactor replaces the combinatorial subclass tree with composable behavior?",
    options: [
      {
        id: "a",
        label: "Add boolean flags for logging, retries, and encryption.",
        code: `class Sender {
  constructor(private log: boolean, private retry: boolean) {}
  // encrypt would be one more flag and one more branch
  send(n: Notification) {
    if (this.log) { /* ... */ }
    if (this.retry) { /* ... */ }
  }
}`,
      },
      {
        id: "b",
        label:
          "Wrap senders with LoggingSender, RetrySender, and EncryptionSender.",
        code: `class LoggingSender implements NotificationSender {
  constructor(private inner: NotificationSender) {}
  send(n: Notification) {
    this.log(n);
    this.inner.send(n);
  }
}
const sender = new LoggingSender(new RetrySender(inner));`,
      },
      {
        id: "c",
        label: "Generate one subclass per channel and feature combination.",
        code: `class SmsLoggedRetryingEncryptedSender extends EncryptedSender {}
class EmailLoggedRetryingEncryptedSender extends EncryptedSender {}
class PushLoggedRetryingEncryptedSender extends EncryptedSender {}
// one more class for every channel and feature combination`,
      },
    ],
    correctOptionId: "b",
    explanation:
      "Each wrapper implements NotificationSender and delegates to another NotificationSender, so logging, retries, and encryption compose in any order at runtime. Flags keep every behavior in one class and still branch internally. More subclasses multiply the combinations instead of removing them.",
  },
  {
    id: 5,
    patternCategory: "Behavioral",
    title: "Strategy",
    scenario:
      "Fee calculation branches on both payment method and customer type. Marketing wants new fee rules for specific combinations, and the function already has more branches than the team can safely test.",
    badCode: `function calculateFee(payment: Payment, customer: Customer) {
  if (payment.method === "card") {
    if (customer.type === "premium") return payment.amount * 0.01;
    if (customer.type === "business") return payment.amount * 0.015;
    return payment.amount * 0.029;
  } else if (payment.method === "bank") {
    if (customer.type === "premium") return 0;
    // ...more branches per customer type
  }
  // ...more branches per payment method
  return 0;
}`,
    question:
      "Which refactor makes fee rules independently changeable while the checkout workflow stays the same?",
    options: [
      {
        id: "a",
        label: "Move the branches into a lookup table of functions.",
        code: `const feeRules: Record<string, (p: Payment, c: Customer) => number> = {
  "card:premium": (p) => p.amount * 0.01,
  "card:business": (p) => p.amount * 0.015,
  "bank:premium": () => 0,
  // every new combination adds another key
};`,
      },
      {
        id: "b",
        label: "Subclass a calculator for each customer type.",
        code: `class PremiumFeeCalculator extends FeeCalculator {
  calculate(p: Payment) {
    if (p.method === "card") return p.amount * 0.01;
    if (p.method === "bank") return 0;
  }
}
// Business and Standard subclasses repeat the payment-method branches`,
      },
      {
        id: "c",
        label:
          "Extract a FeeStrategy interface with interchangeable implementations.",
        code: `interface FeeStrategy {
  calculate(amount: number): number;
}

class CardPremiumFee implements FeeStrategy {
  calculate(amount: number) { return amount * 0.01; }
}

checkout.setFeeStrategy(new CardPremiumFee());`,
      },
    ],
    correctOptionId: "c",
    explanation:
      "Each fee rule becomes its own object behind FeeStrategy, so the checkout workflow can select or replace behavior without knowing any rule details. The lookup table still centralizes every combination under string keys and must grow with each new dimension. Subclassing by customer type leaves payment-method branches duplicated across subclasses.",
  },
  {
    id: 6,
    patternCategory: "Behavioral",
    title: "Observer",
    scenario:
      "After a payment succeeds, completePayment() must trigger a receipt email, an SMS, audit logging, analytics, and receipt generation. Every new post-payment step means editing the payment code.",
    badCode: `async function completePayment(order: Order) {
  await payments.charge(order);
  await emailService.sendReceipt(order);
  await smsService.sendConfirmation(order);
  await auditLog.record(order);
  await analytics.track("payment_completed", order);
  await receiptGenerator.generate(order);
}`,
    question:
      "Which refactor lets teams add post-payment reactions without editing completePayment()?",
    options: [
      {
        id: "a",
        label:
          "Publish a payment-completed event with independent subscribers.",
        code: `eventBus.on("payment.completed", (e) =>
  emailService.sendReceipt(e.order),
);
eventBus.on("payment.completed", (e) =>
  auditLog.record(e.order),
);

await payments.charge(order);
eventBus.emit("payment.completed", { order });`,
      },
      {
        id: "b",
        label: "Move all five calls into a PaymentCompletionService.",
        code: `class PaymentCompletionService {
  async complete(order: Order) {
    await this.email.sendReceipt(order);
    await this.sms.sendConfirmation(order);
    await this.audit.record(order);
    await this.analytics.track(order);
    await this.receipts.generate(order);
  }
}`,
      },
      {
        id: "c",
        label: "Chain the calls with promises inside completePayment().",
        code: `await payments.charge(order);
emailService.sendReceipt(order)
  .then(() => smsService.sendConfirmation(order))
  .then(() => auditLog.record(order))
  .then(() => analytics.track("payment_completed", order))
  .then(() => receiptGenerator.generate(order));`,
      },
    ],
    correctOptionId: "a",
    explanation:
      "With an event, each subscriber registers independently, so a new analytics or receipt step does not touch payment code. The coordinator class and the promise chain keep the same hardcoded list of concrete calls. The trade-off is that ordering and failures are handled per subscriber rather than in one sequence.",
  },
  {
    id: 7,
    patternCategory: "Behavioral",
    title: "Do we need a pattern?",
    scenario:
      "A function picks between exactly two fixed message templates with one if/else. The templates have not changed in two years, and product confirms there will never be a third.",
    badCode: `function messageFor(order: Order): string {
  if (order.isGift) {
    return "Your gift is on its way!";
  } else {
    return "Your order is on its way!";
  }
}`,
    question: "What is the best choice for this code?",
    options: [
      { id: "a", label: "Apply Strategy." },
      { id: "b", label: "Apply Factory Method." },
      { id: "c", label: "Apply Decorator." },
      { id: "d", label: "Keep the simple if/else." },
    ],
    correctOptionId: "d",
    explanation:
      "With two stable branches, the if/else is the clearest and smallest solution. Strategy, Factory Method, and Decorator would each add types and indirection without removing real complexity. Patterns are tools, not requirements: they are not always worth it.",
  },
  {
    id: 8,
    patternCategory: "Structural",
    title: "Which pattern is this?",
    scenario:
      "This class wraps another sender, implements the same NotificationSender interface, and adds retry behavior before delegating. Which pattern does it use?",
    badCode: `class RetryingSender implements NotificationSender {
  constructor(private inner: NotificationSender) {}

  send(n: Notification) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return this.inner.send(n);
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
  }
}`,
    question: "Which pattern is this?",
    options: [
      { id: "a", label: "Adapter" },
      { id: "b", label: "Decorator" },
      { id: "c", label: "Strategy" },
      { id: "d", label: "Observer" },
    ],
    correctOptionId: "b",
    explanation:
      "Decorator wraps an object that shares the same interface and adds behavior while preserving that interface. It is not Adapter: Adapter changes the interface, whereas Decorator keeps it. Strategy swaps an algorithm instead of wrapping, and Observer is about subscribing to events.",
  },
];
