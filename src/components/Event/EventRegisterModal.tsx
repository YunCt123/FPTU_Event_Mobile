import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PinchGestureHandler,
  PinchGestureHandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from "react-native-gesture-handler";

import { seatService, Seat } from "../../services/seatService";
import { eventService } from "../../services/eventService";
import { COLORS, SPACING, FONTS, RADII, SHADOWS } from "../../utils/theme";
import { ActionResultModal, ActionResultType } from "../index";

interface EventRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  venueId?: number;
  eventId?: string;
  eventTitle?: string;
  onSeatSelected?: (seat: Seat) => void;
  onRegisterSuccess?: () => void;
}

const getSeatColor = (seatType?: string) => {
  switch (seatType?.toUpperCase()) {
    case "VIP":
      return "#F59E0B";
    case "STANDARD":
      return COLORS.primary;
    case "STAFF":
      return "#2196F3";
    case "RESERVED":
      return "#A259FF";
    default:
      return "#5C6AC4";
  }
};

const EventRegisterModal: React.FC<EventRegisterModalProps> = ({
  visible,
  onClose,
  venueId,
  eventId,
  eventTitle,
  onSeatSelected,
  onRegisterSuccess,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [registering, setRegistering] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: ActionResultType;
    title: string;
    message: string;
  }>({ visible: false, type: "info", title: "", message: "" });

  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const lastScale = useRef(1);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  useEffect(() => {
    if (visible && venueId) {
      fetchSeats(venueId);
    }
  }, [visible, venueId]);

  useEffect(() => {
    if (!visible) {
      setSelectedSeat(null);
      lastScale.current = 1;
      baseScale.setValue(1);
      pinchScale.setValue(1);
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      translateX.setValue(0);
      translateY.setValue(0);
    }
  }, [visible, baseScale, pinchScale, translateX, translateY]);

  const fetchSeats = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await seatService.getSeatsByVenueId(id, eventId);
      setSeats(data);
    } catch (err) {
      setError("Không thể tải dữ liệu ghế. Vui lòng thử lại.");
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const seatRows = useMemo(() => {
    const grouped: Record<string, Seat[]> = {};

    seats.forEach((seat) => {
      if (!grouped[seat.rowLabel]) {
        grouped[seat.rowLabel] = [];
      }
      grouped[seat.rowLabel].push(seat);
    });

    return Object.entries(grouped)
      .sort(([rowA], [rowB]) =>
        rowA.localeCompare(rowB, undefined, { numeric: true })
      )
      .map(([rowLabel, rowSeats]) => ({
        rowLabel,
        seats: rowSeats.sort((a, b) => a.colLabel - b.colLabel),
      }));
  }, [seats]);

  const legendItems = useMemo(() => {
    const uniqueTypes = Array.from(
      new Map(
        seats.map((seat) => [
          seat.seatType || "Ghế",
          getSeatColor(seat.seatType),
        ])
      ).entries()
    );

    return [
      ...uniqueTypes.map(([label, color]) => ({ label, color })),
      { label: "Đã đặt", color: "#FF6B6B", booked: true },
      { label: "Không khả dụng", color: "#C4C4C4", dashed: true },
    ];
  }, [seats]);

  const handleSeatPress = (seat: Seat) => {
    if (!seat.isActive || seat.isBooked) return;
    setSelectedSeat((prev) => (prev?.id === seat.id ? null : seat));
  };

  const handleConfirm = async () => {
    if (!selectedSeat || !eventId) return;

    try {
      setRegistering(true);
      await eventService.registerEvent({
        eventId: eventId,
        seatId: selectedSeat.id,
      });

      setAlertConfig({
        visible: true,
        type: "success",
        title: "Thành công",
        message: `Đăng ký thành công ghế ${selectedSeat.rowLabel}${selectedSeat.colLabel}!`,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 400
          ? "Yêu cầu không hợp lệ. Ghế có thể đã được đặt hoặc sự kiện đã đóng đăng ký."
          : "Không thể đăng ký sự kiện. Vui lòng thử lại.");

      setAlertConfig({
        visible: true,
        type: "error",
        title: "Lỗi đăng ký",
        message: errorMessage,
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleAlertClose = () => {
    setAlertConfig({ ...alertConfig, visible: false });
    if (alertConfig.type === "success") {
      onSeatSelected?.(selectedSeat!);
      onRegisterSuccess?.();
      onClose();
    }
  };

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      lastScale.current *= event.nativeEvent.scale;
      lastScale.current = Math.min(Math.max(lastScale.current, 0.8), 3);
      baseScale.setValue(lastScale.current);
      pinchScale.setValue(1);
    }
  };

  const onPanEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      lastTranslateX.current += event.nativeEvent.translationX;
      lastTranslateY.current += event.nativeEvent.translationY;
      translateX.setOffset(lastTranslateX.current);
      translateY.setOffset(lastTranslateY.current);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>
                {eventTitle || "Đăng ký ghế"}
              </Text>
              <Text style={styles.modalSubtitle}>
                Chọn ghế mong muốn để hoàn tất đăng ký
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {!venueId ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>
                Không tìm thấy thông tin địa điểm
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchSeats(venueId)}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : seats.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>Địa điểm này không có ghế</Text>
            </View>
          ) : (
            <>
              <View style={styles.stageBadge}>
                <Text style={styles.stageText}>SÂN KHẤU</Text>
              </View>

              <View style={styles.seatScrollContainer}>
                <PanGestureHandler
                  onGestureEvent={onPanEvent}
                  onHandlerStateChange={onPanStateChange}
                  minPointers={1}
                  maxPointers={1}
                >
                  <Animated.View style={{ flex: 1 }}>
                    <PinchGestureHandler
                      onGestureEvent={onPinchEvent}
                      onHandlerStateChange={onPinchStateChange}
                    >
                      <Animated.View
                        style={[
                          styles.seatMapWrapper,
                          {
                            transform: [
                              { translateX },
                              { translateY },
                              { scale },
                            ],
                          },
                        ]}
                      >
                        {seatRows.map((row) => (
                          <View key={row.rowLabel} style={styles.rowContainer}>
                            <Text style={styles.rowLabel}>{row.rowLabel}</Text>
                            <View style={styles.rowSeats}>
                              {row.seats.map((seat) => {
                                const isSelected = selectedSeat?.id === seat.id;
                                const isDisabled = !seat.isActive;
                                const isBooked = seat.isBooked;

                                return (
                                  <TouchableOpacity
                                    key={seat.id}
                                    style={[
                                      styles.seat,
                                      isBooked
                                        ? styles.seatBooked
                                        : isDisabled
                                        ? styles.seatDisabled
                                        : {
                                            backgroundColor: getSeatColor(
                                              seat.seatType
                                            ),
                                          },
                                      isSelected && styles.seatSelected,
                                    ]}
                                    activeOpacity={
                                      isDisabled || isBooked ? 1 : 0.8
                                    }
                                    onPress={() => handleSeatPress(seat)}
                                  >
                                    <Text
                                      style={[
                                        styles.seatText,
                                        (isDisabled || isBooked) &&
                                          styles.seatTextDisabled,
                                      ]}
                                    >
                                      {seat.colLabel}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </Animated.View>
                    </PinchGestureHandler>
                  </Animated.View>
                </PanGestureHandler>
              </View>

              <View style={styles.legendContainer}>
                {legendItems.map((item, index) => (
                  <View
                    key={`${item.label}-${index}`}
                    style={styles.legendItem}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                        item.dashed && styles.legendDotDashed,
                        item.booked && { opacity: 0.6 },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.footer}>
            <View style={styles.selectedSeatInfo}>
              <Text style={styles.selectedSeatLabel}>Ghế đã chọn</Text>
              <Text style={styles.selectedSeatValue}>
                {selectedSeat
                  ? `${selectedSeat.rowLabel}${selectedSeat.colLabel}`
                  : "Chưa chọn"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedSeat || !selectedSeat.isActive || registering) &&
                  styles.confirmButtonDisabled,
              ]}
              disabled={!selectedSeat || !selectedSeat.isActive || registering}
              onPress={handleConfirm}
            >
              {registering ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ActionResultModal
          visible={alertConfig.visible}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={handleAlertClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.title,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    opacity: 0.6,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontSize: FONTS.md,
  },
  emptyText: {
    color: COLORS.text,
    opacity: 0.8,
    textAlign: "center",
    fontSize: FONTS.md,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primary,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONTS.md,
  },
  stageBadge: {
    alignSelf: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  stageText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    fontWeight: "600",
    letterSpacing: 1.6,
  },
  seatScrollContainer: {
    height: 300,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  seatMapWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  rowLabel: {
    width: 32,
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  rowSeats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: SPACING.xs,
  },
  seat: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 32,
    maxWidth: 56,
    borderRadius: RADII.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  seatDisabled: {
    backgroundColor: "#E0E0E0",
  },
  seatBooked: {
    backgroundColor: "#FF6B6B",
    opacity: 0.6,
  },
  seatSelected: {
    backgroundColor: "#6b2a05ff",
  },
  seatText: {
    color: COLORS.white,
    fontSize: FONTS.sm,
    fontWeight: "700",
  },
  seatTextDisabled: {
    color: COLORS.text,
    opacity: 0.5,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendDotDashed: {
    borderWidth: 1,
    borderColor: "#AFAFAF",
    backgroundColor: "transparent",
  },
  legendLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  selectedSeatInfo: {
    flex: 1,
  },
  selectedSeatLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
  },
  selectedSeatValue: {
    fontSize: FONTS.body,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONTS.body,
  },
});

export default EventRegisterModal;
