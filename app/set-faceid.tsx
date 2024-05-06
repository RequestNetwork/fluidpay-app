import { router } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";
import AppButton from "../components/app-button";
import { ScanFace } from "lucide-react-native";

const SetFaceID = () => {
  const setFaceID = () => {};
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4 justify-end items-center">
        <ScanFace size={150} color="#FF238C" />

        <Text className="text-white text-4xl text-center font-semibold my-5">
          Face Recognition
        </Text>
        <Text className="text-xl text-white text-center font-semibold">
          For even faster and more secure access.
        </Text>
      </View>
      <View className="flex-1 mt-auto px-4 justify-end">
        <AppButton
          text="Setup FaceID"
          variant="primary"
          onPress={setFaceID}
          mb="mb-[17px]"
        />
        <AppButton
          text="Skip for now"
          variant="ghost"
          onPress={() => router.push("/app/home")}
        />
      </View>
    </SafeAreaView>
  );
};

export default SetFaceID;
