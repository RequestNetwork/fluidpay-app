import { useMemo, useState } from "react";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArrowLeft, Check, Copy, Pen } from "lucide-react-native";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import { useUserStore } from "../../store";
import Avatar from "../../components/avatar";
import { shortenAddress } from "../../lib/utils";
import AppButton from "../../components/app-button";

const userProfile = () => {
  const user = useUserStore((state) => state.user);
  const [userDetails, setUserDetails] = useState<{
    displayName: string;
    username: string;
  }>({
    displayName: user?.displayName || "",
    username: user?.username || "",
  });

  const handleChange = (key: string, value: string) => {
    setUserDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const details = useMemo(
    () =>
      getDetails(
        { ...userDetails, smartAccountAddress: user?.smartAccountAddress! },
        handleChange
      ),
    [userDetails]
  );

  const hasFarcaster = true;

  const handleConnectFarcaster = () => {};

  return (
    <View className="flex-1 bg-black h-full">
      <View className="flex-1 h-full">
        <Appbar.Header
          elevated={false}
          statusBarHeight={48}
          className="bg-transparent text-white"
        >
          <Appbar.Action
            icon={() => <ArrowLeft size={24} color="#FFF" />}
            onPress={() => {
              router.back();
            }}
            color="#fff"
            size={24}
            animated={false}
          />
          <Appbar.Content
            title=""
            color="#fff"
            titleStyle={{ fontWeight: "bold" }}
          />
        </Appbar.Header>

        <View className="flex-1 flex-col items-center px-4 bg-transparent">
          <Avatar
            name={user?.displayName?.charAt(0)?.toUpperCase() || ""}
            size={90}
          />
          <Text className="text-mutedGrey font-medium text-base mt-2.5 mb-3.5">
            Edit
          </Text>

          <View className="bg-greyInput p-5 rounded-2xl mb-6 space-y-6 w-full">
            {details.map((detail, index) => (
              <Detail
                key={detail.key}
                detailKey={detail.key}
                value={detail.value}
                editable={detail.editable}
                copiable={detail.copiable}
                handleTextChange={detail.handleTextChange}
                marginBottom={index === details.length - 1 ? 0 : 24}
              />
            ))}
          </View>

          {hasFarcaster ? (
            <View className="bg-[#855DCD4D] py-5 px-5 rounded-xl w-full">
              <View className="flex-row items-center justify-center space-x-3.5 mb-6">
                <Image
                  source={require("../../images/icons/farcaster.png")}
                  width={24}
                  height={24}
                />
                <Text className="text-[#855DCD] font-medium text-base">
                  Farcaster account
                </Text>
              </View>
              <View className="flex-row items-center space-x-6 mb-6">
                <Image
                  source={require("../../images/base.png")}
                  className="rounded-full h-[45px] w-[45px]"
                />
                <View className="mb-1">
                  <Text className="text-base text-white font-semibold">
                    limone.eth - serial frame hacker
                  </Text>
                  <Text className="text-base text-mutedGrey font-semibold">
                    @limone.eth
                  </Text>
                </View>
              </View>

              <AppButton
                onPress={() => {}}
                variant="farcaster"
                text="Disconnect Farcaster"
              />
            </View>
          ) : (
            <Pressable
              onPress={handleConnectFarcaster}
              className="bg-[#855DCD4D] py-5 px-10 rounded-xl flex-row items-center justify-center space-x-3.5"
            >
              <Image
                source={require("../../images/icons/farcaster.png")}
                width={24}
                height={24}
              />
              <Text className="text-[#855DCD] font-medium text-base">
                Connect your Farcaster account
              </Text>
            </Pressable>
          )}
        </View>
        <SafeAreaView>
          <View className="mt-auto px-4">
            <AppButton onPress={() => {}} text="Save" variant="primary" />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default userProfile;

const Detail = ({
  detailKey,
  value,
  editable,
  copiable,
  marginBottom = 24,
  handleTextChange,
}: Omit<ReturnType<typeof getDetails>[number], "key"> & {
  detailKey: string;
  marginBottom?: number;
}) => {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <View
      className="flex-row justify-between items-center"
      style={{ marginBottom }}
    >
      <View>
        <Text className="text-mutedGrey text-base font-medium mb-2">
          {detailKey}
        </Text>
        {editing ? (
          <TextInput
            value={value}
            onChangeText={handleTextChange}
            autoFocus
            className="!p-0 h-6 text-primary font-medium !bg-transparent"
            textAlign="left"
            numberOfLines={1}
            style={{ paddingStart: 0, paddingEnd: 0, paddingHorizontal: 0 }}
            textColor="#FF238C"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            cursorColor="#FF238C"
            selectionColor="#FF238C"
            theme={{ colors: { primary: "#FF238C" } }}
          />
        ) : (
          <Text className="text-primary text-base font-medium">{value}</Text>
        )}
      </View>
      {editable &&
        (editing ? (
          <Pressable onPress={() => setEditing(false)}>
            <Check size={20} color={"#FF238C"} />
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Pen size={20} color={"#FF238C"} />
          </Pressable>
        ))}

      {copiable && (
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(value);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1500);
          }}
        >
          {copied ? (
            <Check size={20} color={"#FF238C"} />
          ) : (
            <Copy size={20} color={"#FF238C"} />
          )}
        </Pressable>
      )}
    </View>
  );
};

const getDetails = (
  user: {
    displayName: string;
    username: string;
    smartAccountAddress: string;
  },
  handleChange: (key: string, value: string) => void
) => [
  {
    key: "Display Name",
    value: user?.displayName,
    editable: true,
    copiable: false,
    handleTextChange: (value: string) => handleChange("displayName", value),
  },
  {
    key: "Username",
    value: user?.username,
    editable: true,
    copiable: false,
    handleTextChange: (value: string) => handleChange("username", value),
  },
  {
    key: "Address",
    value: shortenAddress(user?.smartAccountAddress!),
    editable: false,
    copiable: true,
  },
];
