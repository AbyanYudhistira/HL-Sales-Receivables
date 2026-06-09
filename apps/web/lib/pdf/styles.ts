import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  foreground: "#2d2d2d",
  muted: "#5c5c5c",
  border: "#ddd5c8",
  card: "#f0ebe3",
  primary: "#7d9b76",
  success: "#5a8f52",
  warning: "#c4843a",
  info: "#5b7fa8",
};

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: colors.foreground,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    fontSize: 10,
    color: colors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rowLabel: {
    color: colors.muted,
  },
  rowValue: {
    fontFamily: "Helvetica-Bold",
    maxWidth: "60%",
    textAlign: "right",
  },
  totalBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.foreground,
  },
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 10,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 6,
  },
  badgePaid: {
    backgroundColor: "#e8f0e6",
    color: colors.success,
  },
  badgeUnpaid: {
    backgroundColor: "#f5ebe0",
    color: colors.warning,
  },
  badgeGift: {
    backgroundColor: "#e4ebf2",
    color: colors.info,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  note: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 4,
    fontSize: 10,
    color: colors.muted,
  },
});
