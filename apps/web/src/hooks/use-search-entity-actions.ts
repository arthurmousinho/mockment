import {
  ApprovePaymentRequest,
  CancelPaymentRequest,
  DeclinePaymentRequest,
  ProcessPaymentRequest,
  RefundPaymentRequest,
} from "@/http/payments-http";
import {
  CancelInvoiceRequest,
  DeleteInvoiceRequest,
  IssueInvoiceRequest,
  ProcessInvoiceRequest,
} from "@/http/invoices-http";
import {
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
  ResumeSubscriptionRequest,
} from "@/http/subscription-http";
import { DeleteCustomerRequest } from "@/http/customers-http";
import {
  ArrowClockwiseIcon,
  ArrowUUpLeftIcon,
  CheckIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  ProhibitIcon,
  TrashIcon,
  XIcon,
  type Icon,
} from "@phosphor-icons/react";

export type EntityAction = {
  label: string;
  icon: Icon;
  execute: (id: string) => void;
  isPending: boolean;
  confirmation?: "cancel" | "delete";
};

const ENTITY_ROUTES: Record<string, { label: string; path: string }> = {
  pay: { label: "payment", path: "/payments" },
  sub: { label: "subscription", path: "/subscriptions" },
  cus: { label: "customer", path: "/customers" },
  inv: { label: "invoice", path: "/invoices" },
  evt: { label: "event", path: "/events" },
  scn: { label: "scenario", path: "/simulations" },
  run: { label: "simulation run", path: "/simulations/runs" },
  chk: { label: "checkout", path: "/checkout" },
};

export function getEntityPageLabel(path: string) {
  for (const [prefix, entity] of Object.entries(ENTITY_ROUTES)) {
    const start = `${entity.path}/${prefix}_`;
    if (
      path.startsWith(start) &&
      /^[a-zA-Z0-9-]+$/.test(path.slice(start.length))
    ) {
      return `${entity.label[0].toUpperCase()}${entity.label.slice(1)} ${path.slice(entity.path.length + 1)}`;
    }
  }
}

function usePaymentActions(): EntityAction[] {
  const process = ProcessPaymentRequest();
  const approve = ApprovePaymentRequest();
  const decline = DeclinePaymentRequest();
  const cancel = CancelPaymentRequest();
  const refund = RefundPaymentRequest();

  return [
    {
      label: "Process",
      icon: ArrowClockwiseIcon,
      execute: process.mutate,
      isPending: process.isPending,
    },
    {
      label: "Approve",
      icon: CheckIcon,
      execute: approve.mutate,
      isPending: approve.isPending,
    },
    {
      label: "Decline",
      icon: ProhibitIcon,
      execute: decline.mutate,
      isPending: decline.isPending,
    },
    {
      label: "Cancel",
      icon: XIcon,
      execute: cancel.mutate,
      isPending: cancel.isPending,
    },
    {
      label: "Refund",
      icon: ArrowUUpLeftIcon,
      execute: refund.mutate,
      isPending: refund.isPending,
    },
  ];
}

function useInvoiceActions(): EntityAction[] {
  const process = ProcessInvoiceRequest();
  const issue = IssueInvoiceRequest();
  const cancel = CancelInvoiceRequest();
  const remove = DeleteInvoiceRequest();

  return [
    {
      label: "Process",
      icon: ArrowClockwiseIcon,
      execute: process.mutate,
      isPending: process.isPending,
    },
    {
      label: "Issue",
      icon: CheckIcon,
      execute: issue.mutate,
      isPending: issue.isPending,
    },
    {
      label: "Cancel",
      icon: XIcon,
      execute: cancel.mutate,
      isPending: cancel.isPending,
      confirmation: "cancel",
    },
    {
      label: "Delete",
      icon: TrashIcon,
      execute: remove.mutate,
      isPending: remove.isPending,
      confirmation: "delete",
    },
  ];
}

function useSubscriptionActions(): EntityAction[] {
  const resume = ResumeSubscriptionRequest();
  const pause = PauseSubscriptionRequest();
  const cancel = CancelSubscriptionRequest();

  return [
    {
      label: "Resume",
      icon: PlayIcon,
      execute: resume.mutate,
      isPending: resume.isPending,
    },
    {
      label: "Pause",
      icon: PauseIcon,
      execute: pause.mutate,
      isPending: pause.isPending,
    },
    {
      label: "Cancel",
      icon: XIcon,
      execute: cancel.mutate,
      isPending: cancel.isPending,
    },
  ];
}

export function useSearchEntityActions(
  search: string,
  editCustomer: (id: string) => void,
) {
  const paymentActions = usePaymentActions();
  const invoiceActions = useInvoiceActions();
  const subscriptionActions = useSubscriptionActions();
  const deleteCustomer = DeleteCustomerRequest();

  const entities: Record<
    string,
    { label: string; path: string; actions?: EntityAction[] }
  > = {
    ...ENTITY_ROUTES,
    pay: { ...ENTITY_ROUTES.pay, actions: paymentActions },
    inv: { ...ENTITY_ROUTES.inv, actions: invoiceActions },
    sub: { ...ENTITY_ROUTES.sub, actions: subscriptionActions },
    cus: {
      ...ENTITY_ROUTES.cus,
      actions: [
        {
          label: "Edit",
          icon: PencilSimpleIcon,
          execute: editCustomer,
          isPending: false,
        },
        {
          label: "Delete",
          icon: TrashIcon,
          execute: deleteCustomer.mutate,
          isPending: deleteCustomer.isPending,
          confirmation: "delete",
        },
      ],
    },
  };

  const id = search.trim();
  const match = /^([a-z]+)_[a-zA-Z0-9-]+$/.exec(id);
  if (!match || !Object.hasOwn(entities, match[1])) return undefined;

  const entity = entities[match[1]];
  const actions = entity.actions ?? [];

  return {
    id,
    label: entity.label,
    href: `${entity.path}/${id}`,
    actions,
    isActionPending: actions.some((action) => action.isPending),
  };
}
